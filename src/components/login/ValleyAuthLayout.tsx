import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { WinterScene } from './WinterScene';
import { WaterSurface } from './WaterSurface';
import { detectSeason, type Season } from './seasons';
import '@/pages/login-valley.css';

/** Both account routes share one persistent landscape and animation. */
export function ValleyAuthLayout() {
  // Always opens on the real current season; a manual pick only lasts for this visit.
  const [season, setSeason] = useState<Season>(() => {
    localStorage.removeItem('lr-auth-season');
    return detectSeason();
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
          setSeason(item.id);
        }}>{item.label}</button>)}
      </div>
      <Outlet />
    </section>
  </main>;
}
