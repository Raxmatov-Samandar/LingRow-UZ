import { useEffect, useRef, useState } from 'react';

/** Animate the existing photograph's lake pixels; the shoreline stays still. */
export function WaterSurface() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [paused, setPaused] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPaused(preference.matches);
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const context = canvas?.getContext('2d', { alpha: true });
    if (!canvas || !host || !context) return;
    if (paused) { context.clearRect(0, 0, canvas.width, canvas.height); return; }

    const image = new Image();
    const source = document.createElement('canvas');
    const sourceContext = source.getContext('2d');
    if (!sourceContext) return;
    let frame = 0;
    let disposed = false;
    let width = 0;
    let height = 0;
    let waterline = 0;
    let lastTime = 0;
    let elapsed = 0;
    let lastPaint = 0;
    const pointer = { x: -1000, y: -1000, started: -100 };

    function resize() {
      if (!image.naturalWidth) return;
      // A capped render scale keeps the strip animation light on mobile GPUs.
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = Math.round(host!.clientWidth * ratio);
      height = Math.round(host!.clientHeight * ratio);
      canvas!.width = source.width = width;
      canvas!.height = source.height = height;
      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
      const imageWidth = image.naturalWidth * scale;
      const imageHeight = image.naturalHeight * scale;
      const top = (height - imageHeight) / 2;
      sourceContext!.drawImage(image, (width - imageWidth) / 2, top, imageWidth, imageHeight);
      // 79% is below the highest bank, including at narrow cover crops.
      waterline = Math.max(0, Math.min(height, top + imageHeight * .79));
    }

    function draw(now: number) {
      if (disposed) return;
      frame = requestAnimationFrame(draw);
      if (document.hidden || !width) { lastTime = now; return; }
      if (now - lastPaint < 32) return; // 30fps is enough for calm water.
      elapsed += Math.min((now - (lastTime || now)) / 1000, .06);
      lastTime = lastPaint = now;
      context!.clearRect(0, 0, width, height);
      const depth = height - waterline;
      const strength = Math.max(1, width / 550);
      const step = Math.max(1, Math.round(height / 420));
      for (let y = Math.floor(waterline); y < height; y += step) {
        const distance = (y - waterline) / depth;
        const fade = Math.min(1, (y - waterline) / Math.max(12, height * .018));
        const wave = Math.sin(y * .085 - elapsed * 2.0) * 1.8
          + Math.sin(y * .031 + elapsed * 1.25) * 2.2
          + Math.sin(y * .19 - elapsed * 2.8) * .55;
        const shift = wave * strength * (.22 + distance * .78) * fade;
        const bob = Math.sin(y * .06 + elapsed * 1.4) * strength * .38 * fade;
        const slice = Math.min(step, height - y);
        context!.globalAlpha = fade;
        context!.drawImage(source, 0, y, width, slice, shift, y + bob, width, slice + .5);
        // Light catches the same reflected pixels as the ripples travel.
        context!.globalCompositeOperation = 'screen';
        context!.globalAlpha = fade * .035 * (.5 + .5 * Math.sin(y * .045 - elapsed * 1.6));
        context!.drawImage(source, 0, y, width, slice, shift, y + bob, width, slice + .5);
        context!.globalCompositeOperation = 'source-over';

        // A passing ripple bends the real reflection rather than drawing rings.
        const age = elapsed - pointer.started;
        if (age >= 0 && age < 3.5) {
          const radius = age * width * .14;
          const deltaY = (y - pointer.y) * 3;
          if (Math.abs(deltaY) < radius && radius > 1) {
            const reach = Math.sqrt(radius * radius - deltaY * deltaY);
            const left = Math.max(0, Math.floor(pointer.x - reach));
            const span = Math.min(width - left, reach * 2);
            if (span > 0) {
              const ripple = Math.sin(age * 13 - y * .12) * 4 * strength * (1 - age / 3.5) * fade;
              context!.globalAlpha = .65 * fade;
              context!.drawImage(source, left, y, span, slice, left + shift + ripple, y + bob, span, slice + .5);
            }
          }
        }
      }
      context!.globalAlpha = 1;
    }

    function disturb(event: PointerEvent) {
      if (event.pointerType === 'touch') return;
      const bounds = host!.getBoundingClientRect();
      const x = (event.clientX - bounds.left) * width / bounds.width;
      const y = (event.clientY - bounds.top) * height / bounds.height;
      if (y > waterline && elapsed - pointer.started > .8) {
        pointer.x = x; pointer.y = y; pointer.started = elapsed;
      }
    }

    const observer = new ResizeObserver(resize);
    observer.observe(host);
    host.addEventListener('pointermove', disturb, { passive: true });
    image.onload = () => {
      if (disposed) return;
      resize();
      frame = requestAnimationFrame(draw);
    };
    image.src = '/images/login-valley.png';
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      host.removeEventListener('pointermove', disturb);
      image.onload = null;
      context.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [paused]);

  return <canvas ref={canvasRef} className="valley-water" aria-hidden="true" />;
}
