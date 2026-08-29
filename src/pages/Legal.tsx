// =============================================================================
// Privacy Policy + Terms of Service pages.
// Public, no auth required. Both render via the same shell component.
// Content is intentionally short and plain-language; replace with the
// final legal text once it's ready.
// =============================================================================
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Cosmos } from '@/components/layout/Cosmos'
import { EMAIL_LEGAL, EMAIL_SUPPORT, BRAND_NAME, mailto } from '@/lib/contacts'

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <Cosmos />
      <div className="h-screen overflow-y-auto flex flex-col items-center px-4 py-10">
        <div className="w-full max-w-3xl glass-panel p-7">
          <Link to="/" className="text-xs text-cosmic-mint hover:underline">← {BRAND_NAME}</Link>
          <h1 className="mt-3 text-3xl font-extrabold text-white">{title}</h1>
          <div className="mt-5 prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed space-y-3">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}

export function Privacy() {
  const { t } = useTranslation()
  return (
    <Shell title={t('legal.privacy.title')}>
      <p>{t('legal.privacy.intro')}</p>
      <h3 className="text-white font-bold mt-4">{t('legal.privacy.collectTitle')}</h3>
      <p>{t('legal.privacy.collect')}</p>
      <h3 className="text-white font-bold mt-4">{t('legal.privacy.useTitle')}</h3>
      <p>{t('legal.privacy.use')}</p>
      {/* Speech grading sends a recording off the device to a transcription
          service and a grading model. Play's Data Safety form has to declare
          that, and the declaration has to match what this page says. */}
      <h3 className="text-white font-bold mt-4">{t('legal.privacy.shareTitle')}</h3>
      <p>{t('legal.privacy.share')}</p>
      <h3 className="text-white font-bold mt-4">{t('legal.privacy.retentionTitle')}</h3>
      <p>{t('legal.privacy.retention')}</p>
      <h3 className="text-white font-bold mt-4">{t('legal.privacy.childrenTitle')}</h3>
      <p>{t('legal.privacy.children')}</p>
      <h3 className="text-white font-bold mt-4">{t('legal.privacy.contactTitle')}</h3>
      <p>
        {t('legal.privacy.contact')}{' '}
        <a href={mailto(EMAIL_LEGAL, 'Privacy request')} className="text-cosmic-mint hover:underline">{EMAIL_LEGAL}</a>
      </p>
    </Shell>
  )
}

export function Terms() {
  const { t } = useTranslation()
  return (
    <Shell title={t('legal.terms.title')}>
      <p>{t('legal.terms.intro')}</p>
      <h3 className="text-white font-bold mt-4">{t('legal.terms.useTitle')}</h3>
      <p>{t('legal.terms.use')}</p>
      <h3 className="text-white font-bold mt-4">{t('legal.terms.accountsTitle')}</h3>
      <p>{t('legal.terms.accounts')}</p>
      <h3 className="text-white font-bold mt-4">{t('legal.terms.contentTitle')}</h3>
      <p>{t('legal.terms.content')}</p>
      <h3 className="text-white font-bold mt-4">{t('legal.terms.contactTitle')}</h3>
      <p>
        {t('legal.terms.support')}{' '}
        <a href={mailto(EMAIL_SUPPORT, 'Terms inquiry')} className="text-cosmic-mint hover:underline">{EMAIL_SUPPORT}</a>
        {' · '}
        <a href={mailto(EMAIL_LEGAL, 'Legal inquiry')} className="text-cosmic-mint hover:underline">{EMAIL_LEGAL}</a>
      </p>
    </Shell>
  )
}
