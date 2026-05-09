import { useEffect, useState } from 'react';
import { Cosmos } from '@/components/layout/Cosmos';
import { AppShell } from '@/components/layout/AppShell';
import { Topbar } from '@/components/layout/Topbar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { parentApi } from '@/lib/api';
import type { ParentalControls } from '@/types';

export function ParentSettings() {
  const qc = useQueryClient();
  const { data: children } = useQuery({ queryKey: ['parent.children'], queryFn: () => parentApi.getChildren('p1') });
  const [activeChild, setActiveChild] = useState<string | null>(null);

  useEffect(() => { if (children?.length && !activeChild) setActiveChild(children[0].childId); }, [children, activeChild]);

  const { data: controls } = useQuery({
    queryKey: ['parent.controls', activeChild],
    queryFn:  () => parentApi.getControls(activeChild!),
    enabled:  !!activeChild,
  });

  const update = useMutation({
    mutationFn: parentApi.updateControls,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['parent.controls'] }),
  });

  function setField<K extends keyof ParentalControls>(key: K, value: ParentalControls[K]) {
    if (!controls) return;
    update.mutate({ ...controls, [key]: value });
  }

  return (
    <>
      <Cosmos />
      <AppShell>
        <Topbar variant="banner" bannerTitle="Parental Controls" bannerSubtitle="Time limits, content filters, AI safety" />

        <section className="flex-1 min-h-0 overflow-auto flex flex-col gap-5">
          <div className="flex gap-2">
            {children?.map(c => (
              <button key={c.childId}
                      onClick={() => setActiveChild(c.childId)}
                      className={`px-4 py-2 rounded-full text-sm font-bold transition
                                  ${activeChild === c.childId
                                    ? 'bg-cosmic-mint/20 border border-cosmic-mint/50 text-cosmic-mint'
                                    : 'border border-white/10 text-slate-300 hover:bg-white/5'}`}>
                {c.name}
              </button>
            ))}
          </div>

          {controls && (
            <div className="grid grid-cols-2 gap-5">
              <div className="glass-panel p-5">
                <h3 className="text-lg font-bold text-white mb-4">⏰ Time controls</h3>
                <Field label="Daily limit (minutes)">
                  <input type="number" min={15} max={240} step={15}
                         className="input-glass" value={controls.dailyLimitMins}
                         onChange={e => setField('dailyLimitMins', Number(e.target.value))} />
                </Field>
                <Field label="Allowed from">
                  <input type="time" className="input-glass" value={controls.allowedFrom}
                         onChange={e => setField('allowedFrom', e.target.value)} />
                </Field>
                <Field label="Allowed until">
                  <input type="time" className="input-glass" value={controls.allowedTo}
                         onChange={e => setField('allowedTo', e.target.value)} />
                </Field>
              </div>

              <div className="glass-panel p-5">
                <h3 className="text-lg font-bold text-white mb-4">🔒 Content & safety</h3>
                <Toggle label="Allow AI chat (tutor)"
                        checked={controls.aiChatEnabled}
                        onChange={v => setField('aiChatEnabled', v)} />
                <Toggle label="Show community leaderboard"
                        checked={controls.leaderboardVisible}
                        onChange={v => setField('leaderboardVisible', v)} />
                <p className="text-xs text-slate-400 mt-4">
                  When AI chat is disabled, the child can still complete lessons but cannot have free-form
                  conversations with the AI tutor — useful for younger learners.
                </p>
              </div>

              <div className="glass-panel p-5 col-span-2">
                <h3 className="text-lg font-bold text-white mb-4">🔔 Notifications (Push + SMS)</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Toggle label="Daily summary at 8:00 PM"   checked onChange={() => {}} />
                  <Toggle label="When session is missed"     checked onChange={() => {}} />
                  <Toggle label="When new badge earned"      checked onChange={() => {}} />
                  <Toggle label="Weekly progress report"     checked onChange={() => {}} />
                </div>
              </div>
            </div>
          )}
        </section>
      </AppShell>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="block text-xs text-slate-400 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 cursor-pointer">
      <span className="text-sm text-slate-200">{label}</span>
      <button type="button"
              onClick={() => onChange(!checked)}
              className={`relative w-11 h-6 rounded-full transition ${checked ? 'bg-cosmic-mint' : 'bg-white/15'}`}>
        <span className={`absolute top-0.5 ${checked ? 'left-5' : 'left-0.5'} w-5 h-5 rounded-full bg-white transition-all`} />
      </button>
    </label>
  );
}
