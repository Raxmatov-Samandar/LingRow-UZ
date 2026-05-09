import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cosmos } from '@/components/layout/Cosmos';
import { useAuth } from '@/store/auth';
import { parentApi } from '@/lib/api';

export function Onboarding() {
  const { user, setOnboarding } = useAuth();
  const navigate = useNavigate();

  if (!user) { navigate('/login'); return null; }
  if (user.role === 'parent') return <ParentOnboarding />;

  const isAdult = user.role === 'adult';
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<'travel' | 'school' | 'ielts' | 'dtm' | 'work'>('school');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'mastery'>('beginner');
  const [bandTarget, setBandTarget] = useState(6.5);
  const [examDate, setExamDate] = useState('');
  const [dailyMinutes, setDailyMinutes] = useState(30);

  function finish() {
    setOnboarding({ goal, level, bandTarget: isAdult ? bandTarget : undefined,
                    examDate: examDate || undefined, dailyMinutes });
    navigate('/home');
  }

  const totalSteps = isAdult ? 4 : 3;

  return (
    <>
      <Cosmos />
      <div className="h-screen flex items-center justify-center px-6">
        <div className="glass-panel w-full max-w-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Let's personalize your journey</h2>
            <span className="text-xs text-slate-400">Step {step + 1}/{totalSteps}</span>
          </div>

          {step === 0 && (
            <Section title="What's your goal?">
              {([
                ['travel','✈️','Travel & everyday English'],
                ['school','🎒','School / general English'],
                ['ielts','📜','IELTS preparation'],
                ['dtm','🎓','DTM / university entrance'],
                ['work','💼','Work & business'],
              ] as const).map(([id, e, t]) => (
                <Choice key={id} active={goal === id} onClick={() => setGoal(id)} emoji={e} text={t} />
              ))}
            </Section>
          )}

          {step === 1 && (
            <Section title="What's your current level?">
              {(['beginner','intermediate','advanced','mastery'] as const).map(l => (
                <Choice key={l} active={level === l} onClick={() => setLevel(l)}
                        emoji={l === 'beginner' ? '🌱' : l === 'intermediate' ? '🌿' : l === 'advanced' ? '🌳' : '🏆'}
                        text={l[0].toUpperCase() + l.slice(1)} />
              ))}
            </Section>
          )}

          {step === 2 && isAdult && (
            <Section title="IELTS target band & exam date">
              <label className="text-xs text-slate-300">Target band</label>
              <input type="range" min={4.5} max={9} step={0.5} value={bandTarget}
                     onChange={e => setBandTarget(Number(e.target.value))}
                     className="w-full accent-cosmic-mint" />
              <p className="text-3xl font-extrabold text-white mb-3">{bandTarget.toFixed(1)}</p>

              <label className="text-xs text-slate-300">Exam date (optional)</label>
              <input type="date" className="input-glass" value={examDate}
                     onChange={e => setExamDate(e.target.value)} />
            </Section>
          )}

          {(step === (isAdult ? 3 : 2)) && (
            <Section title="Daily study goal">
              {[15, 30, 45, 60].map(m => (
                <Choice key={m} active={dailyMinutes === m} onClick={() => setDailyMinutes(m)}
                        emoji={m <= 15 ? '⚡' : m <= 30 ? '🔥' : m <= 45 ? '💪' : '🏆'}
                        text={`${m} minutes / day`} />
              ))}
            </Section>
          )}

          <div className="flex justify-between mt-6">
            <button className="btn-ghost" onClick={() => setStep(s => Math.max(0, s - 1))}
                    disabled={step === 0}>Back</button>
            {step < totalSteps - 1 ? (
              <button className="btn-mint" onClick={() => setStep(s => s + 1)}>Next →</button>
            ) : (
              <button className="btn-mint" onClick={finish}>Start learning →</button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ---------------- Parent onboarding (link a child via SMS code) ----------------

function ParentOnboarding() {
  const [step, setStep] = useState(0);
  const [childName, setChildName] = useState('');
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = useAuth(s => s.user)!;

  async function generateCode() {
    setLoading(true);
    try {
      const { code } = await parentApi.createLinkCode(user.id, childName);
      setCode(code);
      setStep(1);
    } finally { setLoading(false); }
  }

  return (
    <>
      <Cosmos />
      <div className="h-screen flex items-center justify-center px-6">
        <div className="glass-panel w-full max-w-md p-8">
          <h2 className="text-2xl font-bold text-white mb-2">Link your child</h2>
          <p className="text-sm text-slate-400 mb-6">
            Generate a 6-digit code and have your child enter it in their LingRow app to link the accounts.
          </p>

          {step === 0 ? (
            <div className="flex flex-col gap-3">
              <input className="input-glass" placeholder="Child's name" value={childName}
                     onChange={e => setChildName(e.target.value)} />
              <button className="btn-mint" onClick={generateCode} disabled={!childName || loading}>
                {loading ? 'Generating…' : 'Generate link code'}
              </button>
              <button className="btn-ghost" onClick={() => navigate('/parent')}>Skip for now →</button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-xs text-slate-300 mb-3">Share this code with your child:</p>
              <div className="text-5xl font-extrabold tracking-[0.4em] text-white py-6 mb-4
                              bg-white/5 rounded-2xl border border-white/10">{code}</div>
              <p className="text-xs text-slate-400 mb-5">The code expires in 10 minutes.</p>
              <button className="btn-mint w-full" onClick={() => navigate('/parent')}>Done — go to dashboard</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ---------------- Helpers ----------------

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-base font-bold text-white mb-1">{title}</p>
      {children}
    </div>
  );
}
function Choice({ active, onClick, emoji, text }: { active: boolean; onClick(): void; emoji: string; text: string }) {
  return (
    <button onClick={onClick}
            className={`crystal-card w-full text-left px-4 py-3 transition
                        ${active ? 'ring-2 ring-cosmic-mint/50 bg-white/[0.03]' : 'hover:bg-white/5'}`}>
      <span className="text-xl mr-3">{emoji}</span>
      <span className="text-sm text-white font-medium">{text}</span>
    </button>
  );
}
