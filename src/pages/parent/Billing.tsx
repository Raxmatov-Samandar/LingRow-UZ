import { Cosmos } from '@/components/layout/Cosmos';
import { AppShell } from '@/components/layout/AppShell';
import { Topbar } from '@/components/layout/Topbar';

const PLANS = [
  { id: 'kids',      name: 'Kids',      price: 3,  ages: '10–14', features: ['Gamification', 'Basic grammar', '3 lessons/day'] },
  { id: 'teen',      name: 'Teen',      price: 5,  ages: '14–18', features: ['DTM + English', 'Badges', 'Unlimited lessons'] },
  { id: 'ielts',     name: 'IELTS',     price: 10, ages: '18–30', features: ['Cambridge tests', 'AI feedback', 'Speaking + Writing'] },
  { id: 'family',    name: 'Family',    price: 12, ages: 'Any',   features: ['3 children', 'Parent panel', 'All features'], popular: true },
  { id: 'corporate', name: 'Corporate', price: 15, ages: '25+',   features: ['Business English', 'Team analytics', 'Dedicated support'] },
];

export function Billing() {
  return (
    <>
      <Cosmos />
      <AppShell>
        <Topbar variant="banner" bannerTitle="Billing" bannerSubtitle="Choose a plan that fits your family" />

        <section className="flex-1 min-h-0 overflow-auto flex flex-col gap-5">
          <div className="glass-panel p-5">
            <p className="text-xs text-slate-400">Current plan</p>
            <p className="text-2xl font-extrabold text-white mt-1">Family · $12 / month</p>
            <p className="text-sm text-slate-300 mt-1">Renews on June 4, 2026 · 3 child slots used</p>
            <div className="mt-3 flex gap-2">
              <button className="btn-mint text-xs px-4 py-2">Manage subscription</button>
              <button className="btn-ghost text-xs px-4 py-2">Cancel plan</button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-3">Available plans</h3>
            <div className="grid grid-cols-5 gap-4">
              {PLANS.map(p => (
                <div key={p.id}
                     className={`glass-panel p-5 relative flex flex-col gap-3
                                 ${p.popular ? 'ring-2 ring-cosmic-mint/50' : ''}`}>
                  {p.popular && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-0.5 text-[10px] font-bold rounded-full
                                     bg-cosmic-mint text-slate-900">MOST POPULAR</span>
                  )}
                  <p className="font-bold text-white">{p.name}</p>
                  <p className="text-xs text-slate-400">{p.ages} years</p>
                  <p className="text-3xl font-extrabold text-white">
                    ${p.price}<span className="text-xs font-normal text-slate-400">/mo</span>
                  </p>
                  <ul className="text-xs text-slate-300 flex flex-col gap-1.5 mt-1">
                    {p.features.map(f => <li key={f}>✓ {f}</li>)}
                  </ul>
                  <button className={p.popular ? 'btn-mint mt-auto py-2 text-xs' : 'btn-ghost mt-auto py-2'}>
                    {p.popular ? 'Current plan' : 'Switch'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="glass-panel p-5">
              <h3 className="text-lg font-bold text-white mb-3">Payment method</h3>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10">
                <div className="w-10 h-7 rounded bg-gradient-to-br from-cosmic-sky to-blue-700" />
                <span className="text-sm text-white">Payme · •••• 4242</span>
                <button className="ml-auto text-xs text-slate-400 hover:text-white">Change</button>
              </div>
              <p className="mt-3 text-xs text-slate-400">Also accepting Click, Uzum, and bank transfer.</p>
            </div>

            <div className="glass-panel p-5">
              <h3 className="text-lg font-bold text-white mb-3">Invoice history</h3>
              <ul className="flex flex-col gap-2">
                {[
                  ['May 4, 2026',  '$12.00', 'Family plan · paid'],
                  ['Apr 4, 2026',  '$12.00', 'Family plan · paid'],
                  ['Mar 4, 2026',  '$12.00', 'Family plan · paid'],
                ].map(([d, a, n]) => (
                  <li key={d} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-sm">
                    <span className="text-slate-300">{d}</span>
                    <span className="text-white font-bold">{a}</span>
                    <span className="text-slate-400 text-xs">{n}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </AppShell>
    </>
  );
}
