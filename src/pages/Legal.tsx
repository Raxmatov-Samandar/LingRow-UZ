// =============================================================================
// Privacy Policy + Terms of Service + account deletion pages.
// Public, no auth required — Play requires the deletion page to be reachable
// without installing the app, and the privacy page to be reachable without
// signing in. All three render via the same shell component.
// =============================================================================
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Cosmos } from '@/components/layout/Cosmos'
import { EMAIL_LEGAL, EMAIL_SUPPORT, BRAND_NAME, mailto } from '@/lib/contacts'

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <Cosmos />
      {/* 100dvh, not h-screen: on a phone 100vh includes the URL bar, so the
          bottom of the page sits under it and body's overflow:hidden makes it
          unreachable. */}
      <div className="h-[100dvh] overflow-y-auto flex flex-col items-center px-4 py-10">
        {/* shrink-0 is what makes this page readable at all. As a flex item in a
            fixed-height column the panel was being squeezed to fit the viewport,
            and .glass-panel clips its overflow — so everything past the fold was
            cut off with nothing to scroll. Keeping its natural height hands the
            scrolling back to the container above. */}
        <div className="w-full max-w-3xl shrink-0 glass-panel p-7">
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

/**
 * Account deletion request page.
 *
 * Play requires apps that create accounts to document deletion at a URL a
 * person can reach without the app installed — an in-app mailto link alone
 * does not satisfy it. This page is that URL; it also states exactly what is
 * removed, which the Data Safety declaration has to match.
 */
export function DeleteAccount() {
  const { t } = useTranslation()
  return (
    <Shell title={t('legal.deletion.title')}>
      <p>{t('legal.deletion.intro')}</p>

      <h3 className="text-white font-bold mt-4">{t('legal.deletion.howTitle')}</h3>
      <p>
        {t('legal.deletion.how')}{' '}
        <a href={mailto(EMAIL_LEGAL, 'Account deletion request')} className="text-cosmic-mint hover:underline">
          {EMAIL_LEGAL}
        </a>
      </p>

      <h3 className="text-white font-bold mt-4">{t('legal.deletion.whatTitle')}</h3>
      <p>{t('legal.deletion.what')}</p>

      <h3 className="text-white font-bold mt-4">{t('legal.deletion.whenTitle')}</h3>
      <p>{t('legal.deletion.when')}</p>

      <p className="mt-4">
        <Link to="/legal/privacy" className="text-cosmic-mint hover:underline">
          {t('footer.privacy')}
        </Link>
      </p>
    </Shell>
  )
}
