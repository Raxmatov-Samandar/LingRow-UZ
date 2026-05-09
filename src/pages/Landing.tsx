import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Cosmos } from '@/components/layout/Cosmos';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

export function Landing() {
  const { t } = useTranslation();

  const stats = [
    { t: '50K+', s: t('landing.stats.activeLearners') },
    { t: '6.5+',  s: t('landing.stats.avgBand') },
    { t: '24/7',  s: t('landing.stats.tutor247') },
    { t: '👨‍👩‍👧', s: t('landing.stats.parentPanel') },
  ];

  return (
    <>
      <Cosmos />
      <div className="absolute top-4 right-4 z-20"><LanguageSwitcher /></div>
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
          <p className="text-lg text-slate-300 mb-2">{t('landing.tagline')}</p>
          <p className="text-sm text-slate-400 max-w-xl mx-auto mb-10">
            {t('landing.sub')}
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/login" className="btn-primary">{t('landing.getStarted')}</Link>
            <Link to="/register" className="btn-ghost px-6 py-3">{t('landing.createAccount')}</Link>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            {stats.map(b => (
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
