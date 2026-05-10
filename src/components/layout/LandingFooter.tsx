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
    <footer className="w-full max-w-5xl mt-14 mx-auto px-4 pb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ContactCard
          icon={<MailIcon />}
          dot="bg-cosmic-sky shadow-[0_0_10px_rgba(90,169,255,0.7)]"
          glow="hover:shadow-[0_18px_40px_-12px_rgba(90,169,255,0.45)]"
          title={t('footer.contactTitle')}
          email={EMAIL_HELLO}
          subject="Hello LingRow"
          hint={t('footer.contactHint')}
        />
        <ContactCard
          icon={<LifeRingIcon />}
          dot="bg-cosmic-mint shadow-[0_0_10px_rgba(126,247,211,0.7)]"
          glow="hover:shadow-[0_18px_40px_-12px_rgba(126,247,211,0.45)]"
          title={t('footer.supportTitle')}
          email={EMAIL_SUPPORT}
          subject="Support request"
          hint={t('footer.supportHint')}
        />
        <ContactCard
          icon={<ShieldIcon />}
          dot="bg-violet-400 shadow-[0_0_10px_rgba(196,181,253,0.7)]"
          glow="hover:shadow-[0_18px_40px_-12px_rgba(167,139,250,0.45)]"
          title={t('footer.legalTitle')}
          email={EMAIL_LEGAL}
          subject="Legal inquiry"
          hint={t('footer.legalHint')}
          extra={
            <div className="mt-3 flex gap-2">
              <Link to="/legal/privacy"
                    className="px-2.5 py-1 rounded-full text-[11px] font-semibold border border-white/15 text-slate-200 hover:text-white hover:bg-white/[0.08] hover:border-white/30 transition">
                {t('footer.privacy')}
              </Link>
              <Link to="/legal/terms"
                    className="px-2.5 py-1 rounded-full text-[11px] font-semibold border border-white/15 text-slate-200 hover:text-white hover:bg-white/[0.08] hover:border-white/30 transition">
                {t('footer.terms')}
              </Link>
            </div>
          }
        />
      </div>

      {/* Bottom bar: brand + copyright */}
      <div className="mt-7 flex items-center justify-center gap-2 text-[11px] text-slate-500">
        <span className="font-bold text-slate-300">{BRAND_NAME}</span>
        <span className="opacity-40">·</span>
        <span>{BRAND_DOMAIN}</span>
        <span className="opacity-40">·</span>
        <span>© {yearLabel}</span>
      </div>
    </footer>
  )
}

// ─────────────────────────── Card ───────────────────────────

function ContactCard({ icon, dot, glow, title, email, subject, hint, extra }: {
  icon:    React.ReactNode
  dot:     string
  glow:    string
  title:   string
  email:   string
  subject: string
  hint:    string
  extra?:  React.ReactNode
}) {
  return (
    <a
      href={mailto(email, subject)}
      className={`glass-panel block p-5 transition-all duration-300 hover:-translate-y-1 ${glow}`}
    >
      {/* header row */}
      <div className="flex items-center gap-2.5">
        <span className="relative w-10 h-10 rounded-xl grid place-items-center bg-white/[0.07] border border-white/12 text-white">
          {icon}
          <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${dot}`} />
        </span>
        <span className="text-[11px] uppercase tracking-[0.18em] font-bold text-slate-300">
          {title}
        </span>
      </div>

      {/* email */}
      <p className="mt-3.5 text-[15px] font-extrabold text-white break-all leading-tight tracking-tight">
        {email}
      </p>
      <p className="mt-1.5 text-[11.5px] text-slate-400 leading-relaxed">
        {hint}
      </p>

      {extra}
    </a>
  )
}

// ─────────────────────────── Icons (inline) ───────────────────────────

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  )
}

function LifeRingIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M4.6 4.6l4.4 4.4M19.4 4.6l-4.4 4.4M19.4 19.4l-4.4-4.4M4.6 19.4l4.4-4.4" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l8 3v6c0 4.5-3.4 8.4-8 9-4.6-.6-8-4.5-8-9V6l8-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}
