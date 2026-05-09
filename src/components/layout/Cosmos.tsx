import { useEffect, useRef } from 'react';

export function Cosmos() {
  const starsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = starsRef.current;
    if (!layer) return;
    const count = 320;
    let html = '';
    for (let i = 0; i < count; i++) {
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const size = Math.random() * 1.6 + 0.4;
      const delay = Math.random() * 6;
      const dur = 2.5 + Math.random() * 5;
      const opacity = 0.4 + Math.random() * 0.6;
      html += `<i style="left:${x}%;top:${y}%;width:${size}px;height:${size}px;animation-delay:${delay}s;animation-duration:${dur}s;opacity:${opacity}"></i>`;
    }
    layer.innerHTML = html;
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden"
         style={{
           background: `
             radial-gradient(900px 700px at 78% 22%, #3d1d80 0%, transparent 55%),
             radial-gradient(700px 600px at 90% 75%, #1d3a8a 0%, transparent 60%),
             radial-gradient(500px 500px at 8% 25%, #112a5a 0%, transparent 65%),
             linear-gradient(180deg, #03061a 0%, #04081f 50%, #02040f 100%)`,
         }}>
      <div className="absolute rounded-full mix-blend-screen animate-drift"
           style={{ width: 600, height: 600, top: '3%', right: '3%', filter: 'blur(110px)', opacity: 0.5,
                    background: 'radial-gradient(circle, #8a4dff 0%, #5a2db8 30%, transparent 70%)' }} />
      <div className="absolute rounded-full mix-blend-screen animate-drift"
           style={{ width: 480, height: 480, bottom: '5%', left: '5%', filter: 'blur(110px)', opacity: 0.35, animationDelay: '-7s',
                    background: 'radial-gradient(circle, #2c5fc7 0%, transparent 70%)' }} />
      <div className="absolute rounded-full mix-blend-screen animate-drift"
           style={{ width: 380, height: 380, top: '50%', left: '35%', filter: 'blur(110px)', opacity: 0.12, animationDelay: '-14s',
                    background: 'radial-gradient(circle, #1fb5b0 0%, transparent 65%)' }} />
      <div ref={starsRef} className="stars absolute inset-0" />
    </div>
  );
}
