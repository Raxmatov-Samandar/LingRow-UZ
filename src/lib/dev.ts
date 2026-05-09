// =============================================================================
// Dev / content-admin gate.
//
// Single-account model: ONE specific email is granted access to the Dev Panel
// (upload audio, articles, lessons). Everyone else is a regular learner.
//
// The dev email is configured via VITE_DEV_EMAIL. If unset, defaults to
// 'dev@lingrow.uz'. Lookups are case-insensitive and trim whitespace.
//
// Why an email and not a role enum?
//  - Single-person content creation right now (the founder).
//  - Easy to switch by editing .env — no DB migration needed.
//  - Once we move to real Supabase auth, switch to a profiles.is_dev
//    column or a service-role check.
// =============================================================================

import type { User } from '@/types'

export const DEV_EMAIL: string =
  (import.meta.env.VITE_DEV_EMAIL as string | undefined)?.trim().toLowerCase() ||
  'dev@lingrow.uz'

/** Mock-only: password the dev email must match to unlock the Dev Panel.
 *  When real Supabase auth is wired, password is verified server-side and
 *  this constant becomes a no-op (Supabase enforces it). */
export const DEV_PASSWORD: string =
  (import.meta.env.VITE_DEV_PASSWORD as string | undefined) ?? ''

export function isDevUser(user: User | null | undefined): boolean {
  if (!user?.email) return false
  return user.email.trim().toLowerCase() === DEV_EMAIL
}

export function isDevEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return email.trim().toLowerCase() === DEV_EMAIL
}
