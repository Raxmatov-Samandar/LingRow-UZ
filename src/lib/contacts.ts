// =============================================================================
// LingRow brand contact emails — single source of truth.
// Use these constants everywhere instead of hardcoding addresses, so swapping
// them later is one-line.
// =============================================================================

/** General/marketing contact — shown in landing footer and "Contact us". */
export const EMAIL_HELLO = 'hellolingrow@gmail.com'

/** Technical support — shown in Profile / Help / error states / FAQ. */
export const EMAIL_SUPPORT = 'lingrowsupport@gmail.com'

/** Legal — privacy policy, terms of service, DMCA, account deletion. */
export const EMAIL_LEGAL = 'legallingrow@gmail.com'

export const BRAND_NAME = 'LingRow'
export const BRAND_DOMAIN = 'lingrow.uz'
export const COPYRIGHT_YEAR_START = 2026

/** Build a mailto: URL with optional subject. */
export function mailto(addr: string, subject?: string): string {
  return subject ? `mailto:${addr}?subject=${encodeURIComponent(subject)}` : `mailto:${addr}`
}
