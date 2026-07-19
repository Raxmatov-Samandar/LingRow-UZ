// Click Merchant API (HTTP form-encoded callbacks)
// docs: https://docs.click.uz/click-api-shop/
//
// Click calls us twice per payment:
//   action=0  Prepare   →  validate, return prepare_id
//   action=1  Complete  →  mark paid
//
// Auth: signed with sign_string = md5(click_trans_id + service_id + SECRET_KEY + …)

import { serviceClient } from '../_shared/supabase.ts';
import { PLAN_PRICE_UZS } from '../_shared/pricing.ts';

async function md5(str: string): Promise<string> {
  // Click expects MD5 in lowercase hex. Web Crypto doesn't support MD5,
  // but Deno does via "node:crypto".
  const { createHash } = await import('node:crypto');
  return createHash('md5').update(str).digest('hex');
}

function form(body: URLSearchParams) {
  const o: Record<string, string> = {};
  for (const [k, v] of body) o[k] = v;
  return o;
}

Deno.serve(async (req) => {
  try {
  const sb = serviceClient();
  const params = form(new URLSearchParams(await req.text()));
  const SECRET = Deno.env.get('CLICK_SECRET');
  // Fail closed: an unset secret must never let a signature computed with an
  // empty string pass — that's a signature anyone could forge themselves.
  if (!SECRET) return Response.json({ error: -1, error_note: 'Sign check failed' });

  const action          = Number(params.action);
  const click_trans_id  = params.click_trans_id;
  const service_id      = params.service_id;
  const merchant_trans_id = params.merchant_trans_id;       // our payments.id
  const amount          = Number(params.amount);
  const sign_string     = params.sign_string;
  const sign_time       = params.sign_time;
  const error           = Number(params.error ?? 0);

  // ---- Verify signature ----
  let expectedSig: string;
  if (action === 0) {
    expectedSig = await md5(click_trans_id + service_id + SECRET + merchant_trans_id + amount + action + sign_time);
  } else {
    const merchant_prepare_id = params.merchant_prepare_id ?? '';
    expectedSig = await md5(click_trans_id + service_id + SECRET + merchant_trans_id + merchant_prepare_id + amount + action + sign_time);
  }
  if (expectedSig !== sign_string) {
    return Response.json({ error: -1, error_note: 'Sign check failed' });
  }

  const { data: row } = await sb.from('payments').select('*').eq('id', merchant_trans_id).maybeSingle();
  if (!row) return Response.json({ error: -5, error_note: 'Order not found' });

  const plan = row.raw?.plan;
  const expected = PLAN_PRICE_UZS[plan];
  if (!expected || amount !== expected) {
    return Response.json({ error: -2, error_note: 'Amount mismatch' });
  }

  if (error < 0) {
    await sb.from('payments').update({ status: 'cancelled' }).eq('id', row.id);
    return Response.json({ error: -9, error_note: 'Transaction cancelled' });
  }

  if (action === 0) {                                    // Prepare
    await sb.from('payments').update({
      status: 'pending', external_id: click_trans_id,
    }).eq('id', row.id);
    return Response.json({
      click_trans_id, merchant_trans_id, merchant_prepare_id: row.id,
      error: 0, error_note: 'Success',
    });
  }

  if (action === 1) {                                    // Complete
    // Idempotent: Click retries this call over flaky networks. If we
    // already completed it, return the same success response instead of
    // granting the subscription a second time.
    if (row.status === 'paid') {
      return Response.json({
        click_trans_id, merchant_trans_id,
        merchant_confirm_id: row.id,
        error: 0, error_note: 'Success',
      });
    }
    // payments/subscriptions/profiles writes happen together in one
    // transaction (see perform_payment() migration) — no partial state
    // if the function dies mid-way.
    const { error: performErr } = await sb.rpc('perform_payment', { p_payment_id: row.id, p_plan: plan });
    if (performErr) return Response.json({ error: -1, error_note: 'Could not complete payment' });

    return Response.json({
      click_trans_id, merchant_trans_id,
      merchant_confirm_id: row.id,
      error: 0, error_note: 'Success',
    });
  }

  return Response.json({ error: -3, error_note: 'Unknown action' });
  } catch (e) {
    console.error('[click-merchant]', e);
    return Response.json({ error: -1, error_note: 'Internal error' });
  }
});
