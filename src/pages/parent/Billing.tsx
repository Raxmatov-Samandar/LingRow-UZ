import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Cosmos } from '@/components/layout/Cosmos';
import { AppShell } from '@/components/layout/AppShell';
import { Topbar } from '@/components/layout/Topbar';
import { useAuth } from '@/store/auth';
import { billing } from '@/lib/api';
import { PLAN_PRICE_UZS, formatUzs } from '@/lib/pricing';
import type { Plan } from '@/types';

const PLANS: { id: Plan; name: string; ages: string; features: string[] }[] = [
  { id: 'kids',      name: 'Kids',      ages: '10–14', features: ['Gamification', 'Basic grammar', '3 lessons/day'] },
  { id: 'teen',      name: 'Teen',      ages: '14–18', features: ['DTM + English', 'Badges', 'Unlimited lessons'] },
  { id: 'ielts',     name: 'IELTS',     ages: '18–30', features: ['Cambridge tests', 'AI feedback', 'Speaking + Writing'] },
  { id: 'family',    name: 'Family',    ages: 'Any',   features: ['3 children', 'Parent panel', 'All features'] },
  { id: 'corporate', name: 'Corporate', ages: '25+',   features: ['Business English', 'Team analytics', 'Dedicated support'] },
];

export function Billing() {
  const user = useAuth(s => s.user);
  const qc = useQueryClient();
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  const { data: subscription } = useQuery({
    queryKey: ['billing.subscription'],
    queryFn: () => billing.getCurrentSubscription(),
  });
  const { data: invoices } = useQuery({
    queryKey: ['billing.invoices'],
    queryFn: () => billing.getInvoices(),
  });

  const cancel = useMutation({
    mutationFn: () => billing.cancelSubscription(),
    onSuccess: () => {
      setConfirmingCancel(false);
      qc.invalidateQueries({ queryKey: ['billing.subscription'] });
    },
  });

  function switchTo(planId: Plan) {
    if (!user) return;
    const amountUzs = PLAN_PRICE_UZS[planId];
    const url = billing.paymeCheckoutUrl({ userId: user.id, plan: planId as 'kids'|'teen'|'ielts'|'family'|'corporate', amountUzs });
    window.location.href = url;
  }

  return (
    <>
      <Cosmos />
      <AppShell>
        <Topbar variant="banner" bannerTitle="Billing" bannerSubtitle="Choose a plan that fits your family" />

        <section className="flex-1 min-h-0 overflow-auto flex flex-col gap-5">
          <div className="glass-panel p-5">
            {subscription ? (
              <>
                <p className="text-xs text-slate-400">Current plan</p>
                <p className="text-2xl font-extrabold text-white mt-1 capitalize">
                  {subscription.plan} · {formatUzs(PLAN_PRICE_UZS[subscription.plan] ?? 0)}/month
                </p>
                <p className="text-sm text-slate-300 mt-1">
                  {subscription.cancelAtPeriodEnd ? 'Cancels' : 'Renews'} on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
                {!subscription.cancelAtPeriodEnd && (
                  confirmingCancel ? (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-slate-300">Cancel at the end of the current period?</span>
                      <button className="btn-mint text-xs px-3 py-1.5" disabled={cancel.isPending}
                              onClick={() => cancel.mutate()}>
                        {cancel.isPending ? 'Cancelling…' : 'Yes, cancel'}
                      </button>
                      <button className="btn-ghost text-xs px-3 py-1.5" onClick={() => setConfirmingCancel(false)}>Keep plan</button>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <button className="btn-ghost text-xs px-4 py-2" onClick={() => setConfirmingCancel(true)}>Cancel plan</button>
                    </div>
                  )
                )}
                {subscription.cancelAtPeriodEnd && (
                  <p className="mt-3 text-xs text-amber-300">Your plan won't renew — access continues until the date above.</p>
                )}
              </>
            ) : (
              <>
                <p className="text-xs text-slate-400">Current plan</p>
                <p className="text-2xl font-extrabold text-white mt-1">No active subscription</p>
                <p className="text-sm text-slate-300 mt-1">Pick a plan below to get started.</p>
              </>
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-3">Available plans</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {PLANS.map(p => {
                const isCurrent = subscription?.plan === p.id && !subscription.cancelAtPeriodEnd;
                return (
                  <div key={p.id}
                       className={`glass-panel p-5 relative flex flex-col gap-3
                                   ${isCurrent ? 'ring-2 ring-cosmic-mint/50' : ''}`}>
                    {isCurrent && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-0.5 text-[10px] font-bold rounded-full
                                       bg-cosmic-mint text-slate-900">CURRENT PLAN</span>
                    )}
                    <p className="font-bold text-white">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.ages} years</p>
                    <p className="text-xl font-extrabold text-white">
                      {formatUzs(PLAN_PRICE_UZS[p.id])}<span className="text-xs font-normal text-slate-400">/mo</span>
                    </p>
                    <ul className="text-xs text-slate-300 flex flex-col gap-1.5 mt-1">
                      {p.features.map(f => <li key={f}>✓ {f}</li>)}
                    </ul>
                    <button
                      className={isCurrent ? 'btn-ghost mt-auto py-2 text-xs opacity-50 cursor-default' : 'btn-mint mt-auto py-2 text-xs'}
                      disabled={isCurrent}
                      onClick={() => switchTo(p.id)}
                    >
                      {isCurrent ? 'Current plan' : 'Switch'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="glass-panel p-5">
              <h3 className="text-lg font-bold text-white mb-3">Payment method</h3>
              <p className="text-sm text-slate-300">
                Handled securely by Payme / Click at checkout — LingRow never stores your card details.
              </p>
              <p className="mt-3 text-xs text-slate-400">Also accepting Click, Uzum, and bank transfer.</p>
            </div>

            <div className="glass-panel p-5">
              <h3 className="text-lg font-bold text-white mb-3">Invoice history</h3>
              {!invoices || invoices.length === 0 ? (
                <p className="text-sm text-slate-400">No invoices yet.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {invoices.map(inv => (
                    <li key={inv.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-sm">
                      <span className="text-slate-300">{new Date(inv.date).toLocaleDateString()}</span>
                      <span className="text-white font-bold">{formatUzs(inv.amountUzs)}</span>
                      <span className="text-slate-400 text-xs capitalize">{inv.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </AppShell>
    </>
  );
}
