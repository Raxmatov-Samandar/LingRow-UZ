import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { WinterScene } from './WinterScene';
import { WaterSurface } from './WaterSurface';
import { detectSeason, type Season } from './seasons';
import '@/pages/login-valley.css';

/** Both account routes share one persistent landscape and animation. */
export function ValleyAuthLayout() {
  const [season, setSeason] = useState<Season>(() => {
    const saved = localStorage.getItem('lr-auth-season');
    return saved === 'spring' || saved === 'summer' || saved === 'autumn' || saved === 'winter' ? saved : detectSeason();
  });
  const seasons: { id: Season; label: string }[] = [
    { id: 'spring', label: 'Bahor' }, { id: 'summer', label: 'Yoz' },
    { id: 'autumn', label: 'Kuz' }, { id: 'winter', label: 'Qish' },
  ];
  return <main className="valley-page">
    <section className="valley-window" data-season={season} aria-label="LingRow akkaunt">
      {season === 'summer' ? <WaterSurface /> : <WinterScene season={season} />}
      <div className="valley-seasons" role="group" aria-label="Faslni tanlash">
        {seasons.map(item => <button key={item.id} type="button" aria-pressed={season === item.id} onClick={() => {
          setSeason(item.id); localStorage.setItem('lr-auth-season', item.id);
        }}>{item.label}</button>)}
      </div>
      <Outlet />
    </section>
  </main>;
}
