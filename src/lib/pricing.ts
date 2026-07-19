// Frontend mirror of supabase/functions/_shared/pricing.ts — the browser
// bundle can't import a Deno module directly, so this must be kept in sync
// by hand. These are the amounts Payme/Click actually charge; the old
// Billing page showed unrelated made-up USD prices that didn't match.
export const PLAN_PRICE_UZS: Record<string, number> = {
  kids:      35_000,
  teen:      60_000,
  ielts:     120_000,
  family:    150_000,
  corporate: 180_000,
};

export function formatUzs(amount: number): string {
  return `${amount.toLocaleString('en-US')} so'm`;
}
