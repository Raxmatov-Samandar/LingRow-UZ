// =============================================================================
// LandingFooter — public footer with brand contact emails and legal links.
// All addresses come from src/lib/contacts.ts so they're easy to update.
// =============================================================================
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  EMAIL_HELLO, EMAIL_SUPPORT, EMAIL_LEGAL,
  BRAND_NAME, BRAND_DOMAIN, COPYRIGHT_YEAR_START, mailto,
} from '@/lib/contacts'

export function LandingFooter() {
  const { t } = useTranslation()
  const yearNow = new Date().getFullYear()
  const yearLabel = yearNow > COPYRIGHT_YEAR_START ? `${COPYRIGHT_YEAR_START}–${yearNow}` : String(COPYRIGHT_YEAR_START)

  return (
    <footer className="w-full max-w-5xl mt-12 mx-auto px-4">
      <div className="glass-panel p-5 grid grid-cols-1 md:grid-cols-3 gap-5 text-sm">
        {/* Hello / general */}
        <FooterCol title={t('footer.contactTitle')} hint={t('footer.contactHint')}>
          <a href={mailto(EMAIL_HELLO, 'Hello LingRow')}
             className="text-cosmic-mint hover:underline break-all">{EMAIL_HELLO}</a>
        </FooterCol>

        {/* Support */}
        <FooterCol title={t('footer.supportTitle')} hint={t('footer.supportHint')}>
          <a href={mailto(EMAIL_SUPPORT, 'LingRow support request')}
             className="text-cosmic-mint hover:underline break-all">{EMAIL_SUPPORT}</a>
        </FooterCol>

        {/* Legal */}
        <FooterCol title={t('footer.legalTitle')} hint={t('footer.legalHint')}>
          <a href={mailto(EMAIL_LEGAL, 'Legal inquiry')}
             className="text-cosmic-mint hover:underline break-all">{EMAIL_LEGAL}</a>
          <div className="flex gap-3 mt-2 text-xs text-slate-400">
            <Link to="/legal/privacy" className="hover:text-white">{t('footer.privacy')}</Link>
            <span className="opacity-30">·</span>
            <Link to="/legal/terms" className="hover:text-white">{t('footer.terms')}</Link>
          </div>
        </FooterCol>
      </div>

      <p className="mt-4 text-center text-[11px] text-slate-500">
        © {yearLabel} {BRAND_NAME} · {BRAND_DOMAIN}
      </p>
    </footer>
  )
}

function FooterCol({ title, hint, children }: {
  title: string; hint: string; children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <h4 className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{title}</h4>
      {children}
      <p className="text-[11px] text-slate-500 leading-relaxed">{hint}</p>
    </div>
  )
}
