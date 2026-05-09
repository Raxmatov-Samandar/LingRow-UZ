import { Link } from 'react-router-dom';
import { Cosmos } from '@/components/layout/Cosmos';

export function Landing() {
  return (
    <>
      <Cosmos />
      <div className="h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-2xl">
          <div className="mx-auto mb-8 w-32 h-32 bg-no-repeat"
               style={{
                 backgroundImage: "url('/logo.png')",
                 backgroundPosition: 'center',
                 backgroundSize: '170% auto',
                 filter: 'drop-shadow(0 0 32px rgba(126,247,180,0.55))',
               }} />

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-5
                         bg-gradient-to-b from-white to-blue-200 bg-clip-text text-transparent">
            LingRow
          </h1>
          <p className="text-lg text-slate-300 mb-2">Learn English. Master IELTS. Pass DTM.</p>
          <p className="text-sm text-slate-400 max-w-xl mx-auto mb-10">
            The first AI-powered language platform built for Uzbekistan — with parental controls,
            authentic Cambridge tests, and personalized AI feedback.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/login" className="btn-primary">Get Started</Link>
            <Link to="/register" className="btn-ghost px-6 py-3">Create Account</Link>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            {[
              { t: '50K+', s: 'Active learners' },
              { t: '6.5+',  s: 'Avg. IELTS band' },
              { t: '24/7',  s: 'AI tutor' },
              { t: '👨‍👩‍👧',  s: 'Parent panel' },
            ].map(b => (
              <div key={b.s} className="glass-panel p-4 text-center">
                <p className="text-2xl font-bold text-white">{b.t}</p>
                <p className="text-xs text-slate-400 mt-1">{b.s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
