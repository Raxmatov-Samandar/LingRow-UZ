import { useEffect, useRef } from 'react';

type Point = { x: number; y: number };
type Particle = Point & { vx: number; vy: number; size: number; life: number; maxLife: number; spin: number };
type Crack = { x: number; y: number; at: number; paths: Point[][] };
type Props = { onSnowHit: (x: number, y: number) => void };

const TREES = [
  [.015,.324,.665,.05], [.135,.48,.66,.03], [.22,.47,.63,.025],
  [.277,.388,.635,.05], [.317,.44,.63,.03], [.37,.51,.64,.02],
  [.677,.49,.65,.02], [.70,.45,.64,.025], [.742,.405,.65,.05],
  [.785,.47,.64,.03], [.945,.47,.64,.025], [.98,.42,.65,.03],
];

/** Source-space hit testing keeps effects attached through cover crops/resizes. */
export function WinterInteractions({ onSnowHit }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const callback = useRef(onSnowHit);
  callback.current = onSnowHit;

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !host || !ctx) return;
    let disposed = false;
    let raf = 0;
    let previous = 0;
    let scale = 1;
    let left = 0;
    let top = 0;
    let pixels: Uint8ClampedArray | null = null;
    let ice: Uint8ClampedArray | null = null;
    const particles: Particle[] = [];
    const cracks: Crack[] = [];
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas!.width = Math.round(host!.clientWidth * dpr);
      canvas!.height = Math.round(host!.clientHeight * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      scale = Math.max(host!.clientWidth / 2560, host!.clientHeight / 1440);
      left = (host!.clientWidth - 2560 * scale) / 2;
      top = (host!.clientHeight - 1440 * scale) / 2;
    }
    function screen(p: Point) { return { x: left + p.x * scale, y: top + p.y * scale }; }
    function iceAt(x: number, y: number) {
      if (!ice || x < 0 || x >= 2560 || y < 0 || y >= 1440) return false;
      const index = (Math.floor(y / 4) * 640 + Math.floor(x / 4)) * 4;
      return ice[index] > 90;
    }
    function isTree(x: number, y: number) {
      return TREES.some(([center, start, end, width]) => y / 1440 > start && y / 1440 < end
        && Math.abs(x / 2560 - center) < width * (.17 + .83 * (y / 1440 - start) / (end - start)));
    }
    function snowAt(x: number, y: number) {
      if (!pixels || !isTree(x, y)) return false;
      const index = (Math.floor(y / 4) * 640 + Math.floor(x / 4)) * 4;
      return pixels[index] > 90 && pixels[index + 1] > 110 && pixels[index + 2] > 150;
    }

    function fracture(x: number, y: number, now: number) {
      const paths: Point[][] = [];
      const rays = 6 + Math.floor(Math.random() * 3);
      for (let ray = 0; ray < rays; ray++) {
        const angle = ray * Math.PI * 2 / rays + Math.random() * .3;
        const length = 100 + Math.random() * 180;
        const path: Point[] = [{ x, y }];
        const steps = 7;
        for (let step = 1; step <= steps; step++) {
          const distance = length * step / steps;
          const jitter = (Math.random() - .5) * 20;
          const p = { x: x + Math.cos(angle) * distance + Math.sin(angle) * jitter,
            y: y + Math.sin(angle) * distance * .45 + Math.cos(angle) * jitter * .35 };
          if (!iceAt(p.x, p.y)) break;
          path.push(p);
        }
        paths.push(path);
        if (path.length > 4) {
          const origin = path[3];
          const branchAngle = angle + (Math.random() > .5 ? .65 : -.65);
          const branch = [origin];
          for (let step = 1; step < 4; step++) {
            const p = { x: origin.x + Math.cos(branchAngle) * step * 22 + Math.random() * 7,
              y: origin.y + Math.sin(branchAngle) * step * 12 };
            if (!iceAt(p.x, p.y)) break;
            branch.push(p);
          }
          paths.push(branch);
        }
      }
      if (cracks.length >= 8) cracks.shift();
      cracks.push({ x, y, at: now, paths });
    }

    function pointer(event: PointerEvent) {
      if (event.button !== 0 || (event.target as Element).closest('.valley-card, button, a, input, select')) return;
      const bounds = host!.getBoundingClientRect();
      const x = (event.clientX - bounds.left - left) / scale;
      const y = (event.clientY - bounds.top - top) / scale;
      if (!pixels || x < 0 || x >= 2560 || y < 0 || y >= 1440) return;
      const now = performance.now() / 1000;
      if (snowAt(x, y)) {
        callback.current(x / 2560, y / 1440);
        const count = reduced.matches ? 12 : 80;
        if (particles.length > 600) particles.splice(0, particles.length - 600);
        for (let i = 0; i < count; i++) {
          const life = 1.4 + Math.random() * 1.5;
          particles.push({ x: x + (Math.random() - .5) * 46, y: y + (Math.random() - .5) * 18,
            vx: (Math.random() - .5) * 110, vy: -20 + Math.random() * 45,
            size: 1.5 + Math.random() * (i < 16 ? 7 : 3), life, maxLife: life, spin: Math.random() * 6 });
        }
      } else if (iceAt(x, y)) fracture(x, y, now);
      else return;
      if (!raf) { previous = performance.now(); raf = requestAnimationFrame(draw); }
    }

    function draw(nowMs: number) {
      raf = 0;
      if (disposed) return;
      const dt = Math.min((nowMs - previous) / 1000, .04);
      previous = nowMs;
      const now = nowMs / 1000;
      ctx!.clearRect(0, 0, host!.clientWidth, host!.clientHeight);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= dt;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        p.vy += (reduced.matches ? 40 : 155) * dt;
        p.x += (p.vx + Math.sin(now * 3 + p.spin) * 12) * dt;
        p.y += p.vy * dt;
        const at = screen(p);
        const alpha = Math.min(1, p.life / .65);
        ctx!.fillStyle = `rgba(240,248,255,${alpha * .92})`;
        ctx!.beginPath();
        ctx!.ellipse(at.x, at.y, Math.max(.7, p.size * scale), Math.max(.5, p.size * scale * .65), p.spin + now, 0, Math.PI * 2);
        ctx!.fill();
      }
      for (let i = cracks.length - 1; i >= 0; i--) {
        const crack = cracks[i];
        const age = now - crack.at;
        if (age > 14) { cracks.splice(i, 1); continue; }
        const progress = reduced.matches ? 1 : Math.min(1, age / .48);
        const opacity = Math.min(1, (14 - age) / 3);
        for (const path of crack.paths) {
          const extent = (path.length - 1) * progress;
          if (extent <= 0) continue;
          ctx!.beginPath();
          const start = screen(path[0]);
          ctx!.moveTo(start.x, start.y);
          for (let j = 1; j < path.length; j++) {
            const part = Math.min(1, extent - (j - 1));
            if (part <= 0) break;
            const p = screen({ x: path[j - 1].x + (path[j].x - path[j - 1].x) * part,
              y: path[j - 1].y + (path[j].y - path[j - 1].y) * part });
            ctx!.lineTo(p.x, p.y);
          }
          ctx!.lineJoin = 'round';
          ctx!.strokeStyle = `rgba(11,37,76,${opacity * .85})`;
          ctx!.lineWidth = Math.max(1.6, scale * 3);
          ctx!.stroke();
          ctx!.strokeStyle = `rgba(218,245,255,${opacity})`;
          ctx!.lineWidth = Math.max(.7, scale * 1.15);
          ctx!.stroke();
        }
      }
      if (particles.length || cracks.length) raf = requestAnimationFrame(draw);
    }

    const read = async (url: string) => {
      const image = new Image(); image.src = url; await image.decode();
      const sample = document.createElement('canvas'); sample.width = 640; sample.height = 360;
      const context = sample.getContext('2d', { willReadFrequently: true });
      if (!context) throw new Error('Cannot read winter interaction masks');
      context.drawImage(image, 0, 0, 640, 360);
      return context.getImageData(0, 0, 640, 360).data;
    };
    Promise.all([read('/images/winter/scene.webp'), read('/images/winter/ice-mask.png')])
      .then(([source, mask]) => { if (!disposed) { pixels = source; ice = mask; } })
      .catch(error => { if (!disposed) console.warn('Winter click effects unavailable.', error); });
    resize();
    const observer = new ResizeObserver(resize); observer.observe(host);
    host.addEventListener('pointerdown', pointer);
    return () => { disposed = true; cancelAnimationFrame(raf); observer.disconnect(); host.removeEventListener('pointerdown', pointer); };
  }, []);

  return <canvas ref={ref} className="winter-interactions" aria-hidden="true" />;
}
