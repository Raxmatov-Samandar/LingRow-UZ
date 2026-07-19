// Single source of truth for plan prices (so'm), shared by payme-merchant and
// click-merchant. Previously duplicated verbatim in both files — a price
// change applied to one and not the other would have silently desynced billing.
export const PLAN_PRICE_UZS: Record<string, number> = {
  kids:      35_000,
  teen:      60_000,
  ielts:     120_000,
  family:    150_000,
  corporate: 180_000,
};
