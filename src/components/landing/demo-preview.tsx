import { DemoStage } from '@/components/demo-stage';
import type { Demo } from '@/engine/types';
import { cn } from '@/lib/utils';

/**
 * A live demo shrunk into a thumbnail: the stage renders at full size inside a wrapper that is
 * 1/scale wide, then the wrapper is scaled down, so the demo lays out exactly as it does in the gallery.
 */
export function DemoPreview({ demo, scale = 0.5, className }: { demo: Demo; scale?: number; className?: string }) {
  return (
    <div className={cn('pointer-events-none relative overflow-hidden', className)} aria-hidden="true" inert>
      <div className="absolute top-0 left-0 origin-top-left" style={{ width: `${100 / scale}%`, height: `${100 / scale}%`, transform: `scale(${scale})` }}>
        <DemoStage demo={demo} frame={false} className="h-full" />
      </div>
    </div>
  );
}
