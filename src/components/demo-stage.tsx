import { useCallback, useEffect, useImperativeHandle, useRef, type Ref } from 'react';
import { createTimers } from '@/engine/registry';
import type { Demo, DemoContext, Timers } from '@/engine/types';
import { usePlayback } from '@/providers/playback-provider';
import { cn } from '@/lib/utils';
import { ComposerPlayground } from '@/components/landing/composer-playground';

export interface DemoStageHandle {
  restart: () => void;
}

const LOOP_PAUSE = 3800;
const STAGE_PADDING: Record<string, string> = {
  scene: 'min-h-[327px] p-4 sm:p-8',
  lib: 'p-2',
  chat: 'min-h-[520px] p-2',
};

/**
 * Mounts one imperative demo. React owns the stage <div>; the demo's run() owns everything inside it.
 * The demo plays while the stage is near the viewport and stops (every timer cleared) when it leaves,
 * when the component unmounts, or when it restarts.
 */
/** Demos that have a live React version: the reader can type into them instead of watching a script. */
const LIVE: Record<string, (p: { ref?: Ref<DemoStageHandle>; bare?: boolean; className?: string }) => React.ReactNode> = {
  'agent-composer-loader': (p) => <ComposerPlayground {...p} />,
};

export function DemoStage(props: { demo: Demo; ref?: Ref<DemoStageHandle>; className?: string; frame?: boolean }) {
  const Live = LIVE[props.demo.slug];
  if (!Live) return <ScriptStage {...props} />;
  const { ref, frame = true, className } = props;
  const live = <Live ref={ref} bare className={cn('w-full', className)} />;
  return frame ? <div className="overflow-hidden rounded-3xl border border-border-component-detail-container">{live}</div> : live;
}

function ScriptStage({ demo, ref, className, frame = true }: { demo: Demo; ref?: Ref<DemoStageHandle>; className?: string; frame?: boolean }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const { loop, replayToken } = usePlayback();
  const loopRef = useRef(loop);
  loopRef.current = loop;
  const state = useRef<{ t: Timers | null; running: boolean; onscreen: boolean }>({ t: null, running: false, onscreen: false });
  // Demos keep state across runs on ctx (variant cycles, counters), exactly like the vanilla gallery.
  const ctx = useRef<DemoContext>({});

  const stop = useCallback(() => {
    state.current.t?.clear();
    state.current.running = false;
  }, []);

  const start = useCallback(async () => {
    const root = stageRef.current;
    if (!root) return;
    const st = state.current;
    st.t?.clear();
    const my = createTimers();
    st.t = my;
    st.running = true;
    root.replaceChildren();
    try {
      ctx.current.restart = () => void start();
      await demo.run(root, my, ctx.current);
    } catch (error) {
      if (!my.dead) console.error(demo.title, error);
    }
    if (my !== st.t || my.dead) return;
    if (loopRef.current) {
      await my.sleep(LOOP_PAUSE);
      if (my === st.t && !my.dead) void start();
      return;
    }
    st.running = false;
  }, [demo]);

  useImperativeHandle(ref, () => ({ restart: () => void start() }), [start]);

  // Play while near the viewport, stop when scrolled away.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        state.current.onscreen = entry.isIntersecting;
        if (entry.isIntersecting && !state.current.running) void start();
        else if (!entry.isIntersecting && state.current.running) stop();
      },
      { rootMargin: '200px 0px' },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      stop();
    };
  }, [start, stop]);

  // Turning Loop back on picks up the demos that finished on screen.
  useEffect(() => {
    if (loop && state.current.onscreen && !state.current.running) void start();
  }, [loop, start]);

  // "Replay all": restart what is on screen, staggered so they don't all begin on the same frame.
  const firstToken = useRef(replayToken);
  useEffect(() => {
    if (replayToken === firstToken.current || !state.current.onscreen) return;
    const id = setTimeout(() => void start(), (demo.index % 8) * 60);
    return () => clearTimeout(id);
  }, [replayToken, start, demo.index]);

  const stage = <div ref={stageRef} className={cn('sui-stage flex w-full items-center justify-center', STAGE_PADDING[demo.kind ?? 'chat'], className)} />;
  // frame=false: the caller draws its own surface (landing showcase, preview tiles).
  return frame ? <div className="overflow-hidden rounded-3xl border border-border-component-detail-container">{stage}</div> : stage;
}
