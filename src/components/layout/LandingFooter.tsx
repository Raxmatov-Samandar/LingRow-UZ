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
    <footer className="w-full max-w-5xl mt-14 mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ContactCard
          icon={<MailIcon />}
          accent="from-cosmic-sky/20 to-transparent"
          ring="border-cosmic-sky/25 hover:border-cosmic-sky/55"
          title={t('footer.contactTitle')}
          email={EMAIL_HELLO}
          subject="Hello LingRow"
          hint={t('footer.contactHint')}
        />
        <ContactCard
          icon={<LifeRingIcon />}
          accent="from-cosmic-mint/20 to-transparent"
          ring="border-cosmic-mint/25 hover:border-cosmic-mint/55"
          title={t('footer.supportTitle')}
          email={EMAIL_SUPPORT}
          subject="Support request"
          hint={t('footer.supportHint')}
        />
        <ContactCard
          icon={<ShieldIcon />}
          accent="from-violet-400/20 to-transparent"
          ring="border-violet-400/25 hover:border-violet-400/55"
          title={t('footer.legalTitle')}
          email={EMAIL_LEGAL}
          subject="Legal inquiry"
          hint={t('footer.legalHint')}
          extra={
            <div className="mt-3 flex gap-2">
              <Link to="/legal/privacy"
                    className="px-2.5 py-1 rounded-full text-[11px] font-semibold border border-white/12 text-slate-200 hover:text-white hover:border-white/30 transition">
                {t('footer.privacy')}
              </Link>
              <Link to="/legal/terms"
                    className="px-2.5 py-1 rounded-full text-[11px] font-semibold border border-white/12 text-slate-200 hover:text-white hover:border-white/30 transition">
                {t('footer.terms')}
              </Link>
            </div>
          }
        />
      </div>

      {/* Bottom bar: brand + copyright */}
      <div className="mt-6 mb-3 flex items-center justify-center gap-2 text-[11px] text-slate-500">
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

function ContactCard({ icon, accent, ring, title, email, subject, hint, extra }: {
  icon:    React.ReactNode
  accent:  string
  ring:    string
  title:   string
  email:   string
  subject: string
  hint:    string
  extra?:  React.ReactNode
}) {
  return (
    <a
      href={mailto(email, subject)}
      className={`group relative rounded-2xl p-5 bg-white/[0.03] border ${ring} transition-all duration-200
                  hover:bg-white/[0.06] hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.25)]`}
    >
      {/* soft accent gradient at top-right */}
      <div className={`pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-bl ${accent} opacity-60 group-hover:opacity-90 transition-opacity`} />

      <div className="relative">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl grid place-items-center bg-white/[0.06] border border-white/10 text-slate-200 group-hover:bg-white/[0.1]">
            {icon}
          </span>
          <span className="text-[10px] uppercase tracking-[0.18em] font-bold text-slate-400 group-hover:text-slate-300">
            {title}
          </span>
        </div>

        <p className="mt-3 text-[15px] font-bold text-white break-all leading-tight">
          {email}
        </p>
        <p className="mt-1.5 text-[11.5px] text-slate-400 leading-relaxed">
          {hint}
        </p>

        {extra}
      </div>
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
