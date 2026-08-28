// =============================================================================
// Platform detection — distinguishes the native Capacitor app from the web app.
//
// Why this exists: Google Play requires digital subscriptions to be sold via
// Google Play Billing. LingRow's Billing page checks out through Payme/Click,
// which would violate that policy inside the Android app. Until Play Billing
// is wired up, every payment surface is hidden when running natively; the web
// app at ling-row.uz keeps them.
// =============================================================================
import { Capacitor } from '@capacitor/core'

/** True inside the Capacitor Android/iOS shell, false in a normal browser. */
export function isNativeApp(): boolean {
  try {
    return Capacitor.isNativePlatform()
  } catch {
    // Capacitor isn't present in some test/SSR contexts — treat as web.
    return false
  }
}

/**
 * Whether payment / subscription UI may be shown.
 * Web: yes. Native app: no (see the policy note above).
 */
export function canShowPayments(): boolean {
  return !isNativeApp()
}
