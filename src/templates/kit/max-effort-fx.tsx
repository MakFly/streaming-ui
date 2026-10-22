import { useCallback, useEffect, useRef, useState } from 'react';

/* The "Max" effort effect, built for the model picker's effort slider (multi-agent chat): at the
 * top step the track turns into a jet. A dark tint, white star streaks blowing left, and a WebGL plume burning
 * from the thumb (blue-600 → blue-400 → blue-200 → white-hot core) that throttles up over 1.4 s. Without WebGL
 * it falls back to a pixel field; with reduced motion, to a still gradient. */

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision mediump float;
uniform vec2 u_res;
uniform float u_time;
uniform float u_power; // 0 -> 1 throttle-up after ignition

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.1 + vec2(37.4, 17.9);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float d = 1.0 - uv.x;            // 0 at the nozzle (right) -> 1 far left
  float y = (uv.y - 0.5) * 2.0;    // -1 bottom .. 1 top

  float turb = fbm(vec2(uv.x * 5.5 + u_time * 3.2, uv.y * 3.5 + u_time * 0.4)) - 0.5;
  float sway = (fbm(vec2(u_time * 1.6, uv.x * 2.0)) - 0.5) * 0.55;

  float width = mix(1.05, 0.12, smoothstep(0.0, 1.0, d)) * mix(0.35, 1.0, u_power);
  float reach = mix(0.18, 1.05, u_power);
  float shape = 1.0 - smoothstep(width * 0.35, width, abs(y + sway * d + turb * (0.35 + d * 0.9)));
  float len = 1.0 - smoothstep(0.15 * u_power, reach, d + turb * 0.45 * u_power);
  float flame = clamp(shape * len, 0.0, 1.0);

  float core = (1.0 - smoothstep(0.0, 0.38 * mix(0.5, 1.0, u_power), d + turb * 0.15)) * (1.0 - smoothstep(0.0, 0.55, abs(y)));
  flame = clamp(flame + core * 0.6, 0.0, 1.0) * mix(0.6, 1.0, u_power);

  float glow = (1.0 - smoothstep(0.0, 0.85, d)) * (1.0 - smoothstep(0.2, 1.15, abs(y))) * 0.4 * u_power;

  vec3 c600 = vec3(0.082, 0.365, 0.988);
  vec3 c400 = vec3(0.318, 0.635, 1.0);
  vec3 c200 = vec3(0.741, 0.867, 1.0);
  vec3 col = mix(c600, c400, smoothstep(0.2, 0.6, flame));
  col = mix(col, c200, smoothstep(0.62, 0.95, flame) * (1.0 - smoothstep(0.1, 0.75, d)));
  float hot = smoothstep(0.9, 1.0, flame) * (1.0 - smoothstep(0.02, 0.3, d));
  col = mix(col, vec3(1.0), hot);

  float alpha = smoothstep(0.04, 0.55, flame) * 0.96 + glow;
  gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
}
`;

/** Sizes a canvas to its box at device resolution and returns a 2D context in CSS pixels. */
function setup2d(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const { width, height } = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);
  return { ctx, width, height };
}

/** 40 white streaks blowing left at their own speed, and now and then a faster shooting star. */
function StarStreaks() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const s = ref.current && setup2d(ref.current);
    if (!s) return;
    const { ctx, width: w, height: h } = s;
    type Star = { x: number; y: number; speed: number; size: number; alpha: number; life?: number };
    const spawn = (anywhere: boolean): Star => {
      const t = Math.random();
      return { x: anywhere ? Math.random() * w : w + 4, y: 1 + Math.random() * (h - 2), speed: 18 + 90 * t, size: 0.6 + t, alpha: 0.4 + 0.55 * t };
    };
    const stars = Array.from({ length: 40 }, () => spawn(true));
    let shooter: Star | null = null;
    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx.clearRect(0, 0, w, h);
      for (const star of stars) {
        star.x -= star.speed * dt;
        if (star.x < -6) Object.assign(star, spawn(false));
        const tail = 0.05 * star.speed;
        const g = ctx.createLinearGradient(star.x, star.y, star.x + tail, star.y);
        g.addColorStop(0, `rgba(255,255,255,${star.alpha.toFixed(3)})`);
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(star.x, star.y - star.size / 2, tail + star.size, star.size);
      }
      if (!shooter && Math.random() < dt / 2.5) shooter = { ...spawn(false), speed: 260 + 120 * Math.random(), size: 1.2, alpha: 0.9, life: 1 };
      if (shooter) {
        shooter.x -= shooter.speed * dt;
        shooter.life! -= 0.9 * dt;
        if (shooter.x < -40 || shooter.life! <= 0) shooter = null;
        else {
          const a = shooter.alpha * Math.max(shooter.life!, 0);
          const g = ctx.createLinearGradient(shooter.x, shooter.y, shooter.x + 26, shooter.y);
          g.addColorStop(0, `rgba(255,255,255,${a.toFixed(3)})`);
          g.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = g;
          ctx.fillRect(shooter.x, shooter.y - 0.6, 26, 1.2);
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} aria-hidden className="absolute inset-0 size-full" />;
}

/** The no-WebGL fallback: a blue gradient under a field of 2px pixels, denser toward the thumb. */
function PixelField() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const s = ref.current && setup2d(ref.current);
    if (!s) return;
    const { ctx, width: w, height: h } = s;
    const cols = Math.ceil(w / 3);
    const rows = Math.ceil(h / 3);
    const palette = [
      [142, 197, 255],
      [81, 162, 255],
      [43, 127, 255],
      [21, 93, 252],
    ];
    let raf = 0;
    let drawn = 0;
    const frame = (now: number) => {
      if (now - drawn > 70) {
        drawn = now;
        ctx.clearRect(0, 0, w, h);
        for (let c = 0; c < cols; c++) {
          const t = c / (cols - 1);
          const density = 0.78 * Math.pow(t, 1.6);
          for (let r = 0; r < rows; r++) {
            if (Math.random() >= density) continue;
            const [R, G, B] = palette[(Math.random() * palette.length) | 0];
            const a = (0.15 + 0.85 * Math.random()) * (0.35 + 0.65 * t);
            ctx.fillStyle = `rgba(${R},${G},${B},${a.toFixed(3)})`;
            ctx.fillRect(3 * c, 3 * r, 2, 2);
          }
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-l from-blue-300/90 via-blue-300/30 to-transparent" />
      <canvas ref={ref} className="absolute inset-0 size-full" />
    </>
  );
}

/** The WebGL plume; reports failure so the caller can fall back. */
function Plume({ onFail }: { onFail: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
    if (!gl) return onFail();
    const { width, height } = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);
    const shader = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return sh;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return onFail();
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(gl.getUniformLocation(prog, 'u_res'), canvas.width, canvas.height);
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uPower = gl.getUniformLocation(prog, 'u_power');
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    const start = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      const t = (now - start) / 1000;
      gl.uniform1f(uTime, t);
      // Ignition: the throttle eases up over 1.4 s (cubic ease-out).
      gl.uniform1f(uPower, 1 - Math.pow(1 - Math.min(t / 1.4, 1), 3));
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    // No loseContext() here: StrictMode re-runs this effect on the same canvas, which would hand back the
    // lost context and fail the shader link. The context goes with the canvas when the overlay unmounts.
    return () => cancelAnimationFrame(raf);
  }, [onFail]);
  return <canvas ref={ref} className="absolute inset-0 size-full" />;
}

/**
 * The overlay itself. Mounted while `active` and for 300 ms after, so it fades out instead of vanishing
 * (an AnimatePresence-style exit).
 */
export function MaxEffortFx({ active }: { active: boolean }) {
  const [mounted, setMounted] = useState(active);
  const [visible, setVisible] = useState(false);
  const [noGl, setNoGl] = useState(false);
  // Stable, or the plume's effect would tear down and recompile the shader on every render.
  const fail = useCallback(() => setNoGl(true), []);
  const [still] = useState(() => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    if (active) {
      setMounted(true);
      // A timer, not a frame, so the fade-in still happens in a tab that is not painting.
      const id = window.setTimeout(() => setVisible(true), 20);
      return () => window.clearTimeout(id);
    }
    setVisible(false);
    const id = window.setTimeout(() => setMounted(false), 300);
    return () => window.clearTimeout(id);
  }, [active]);

  if (!mounted) return null;
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 transition-opacity duration-300 ease-out ${visible ? 'opacity-100' : 'opacity-0'}`}>
      {still ? (
        <div className="absolute inset-0 rounded-lg bg-gradient-to-l from-blue-500 via-blue-400/60 to-[rgba(16,24,40,0.62)]" />
      ) : noGl ? (
        <PixelField />
      ) : (
        <>
          <div className="absolute inset-0 rounded-lg bg-[rgba(16,24,40,0.62)]" />
          <StarStreaks />
          <Plume onFail={fail} />
        </>
      )}
    </div>
  );
}

/** Where each tick flies when the slider hits Max: left, up or down, spun, staggered. */
export const scatterTicks = (n: number) =>
  Array.from({ length: n }, () => ({ x: -(70 + 130 * Math.random()), y: (Math.random() - 0.5) * 70, rotate: (Math.random() - 0.5) * 720, delay: 0.3 * Math.random() }));
