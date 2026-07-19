// Payme Merchant API (JSON-RPC over HTTPS)
// docs: https://developer.help.payme.uz/initsializatsiya-platezha
//
// Required methods (Payme calls us):
//   CheckPerformTransaction
//   CreateTransaction
//   PerformTransaction
//   CancelTransaction
//   CheckTransaction
//   GetStatement
//
// Auth: Basic with merchant key (PAYME_MERCHANT_KEY).

import { serviceClient } from '../_shared/supabase.ts';
import { PLAN_PRICE_UZS } from '../_shared/pricing.ts';

const ERR = {
  INVALID_AMOUNT:   { code: -31001, message: { en: 'Invalid amount' } },
  USER_NOT_FOUND:   { code: -31050, message: { en: 'User not found' } },
  TRANS_NOT_FOUND:  { code: -31003, message: { en: 'Transaction not found' } },
  CANT_PERFORM:     { code: -31008, message: { en: 'Cannot perform' } },
  AUTH:             { code: -32504, message: { en: 'Forbidden' } },
};

function rpcResult(id: unknown, result: unknown) {
  return new Response(JSON.stringify({ id, result }), { headers: { 'Content-Type': 'application/json' } });
}
function rpcError(id: unknown, error: { code: number; message: { en: string } }) {
  return new Response(JSON.stringify({ id, error }), { headers: { 'Content-Type': 'application/json' } });
}

async function checkAuth(req: Request): Promise<boolean> {
  const expected = Deno.env.get('PAYME_MERCHANT_KEY');
  if (!expected) return false;   // fail closed — a missing secret must never mean "allow everyone"
  const auth = req.headers.get('Authorization') ?? '';
  if (!auth.startsWith('Basic ')) return false;
  const decoded = atob(auth.slice(6));
  return decoded === `Paycom:${expected}`;
}

Deno.serve(async (req) => {
  if (!(await checkAuth(req))) return rpcError(null, ERR.AUTH);
  const body = await req.json();
  const { id, method, params } = body;
  const sb = serviceClient();

  switch (method) {
    case 'CheckPerformTransaction': {
      const userId = params.account?.user_id;
      const plan   = params.account?.plan;
      const amount = params.amount;            // tiyin

      const expected = PLAN_PRICE_UZS[plan] * 100;
      if (!expected || amount !== expected) return rpcError(id, ERR.INVALID_AMOUNT);

      const { data: u } = await sb.from('profiles').select('id').eq('id', userId).maybeSingle();
      if (!u) return rpcError(id, ERR.USER_NOT_FOUND);
      return rpcResult(id, { allow: true });
    }

    case 'CreateTransaction': {
      const { id: trans_id, time, amount, account } = params;
      const { data: existing } = await sb.from('payments')
        .select('*').eq('provider', 'payme').eq('external_id', trans_id).maybeSingle();
      if (existing) {
        return rpcResult(id, { create_time: new Date(existing.created_at).getTime(), transaction: existing.id, state: 1 });
      }
      const ins = await sb.from('payments').insert({
        user_id:   account.user_id,
        provider:  'payme',
        external_id: trans_id,
        amount_uzs:  amount / 100,
        status:    'pending',
        raw:       { time, account },
      }).select().single();
      if (ins.error) {
        // Unique-violation (payments_provider_external_id_key) means a
        // concurrent retry of this same CreateTransaction call already won —
        // Payme expects the same answer on retry, not an error.
        if (ins.error.code === '23505') {
          const { data: raced } = await sb.from('payments')
            .select('*').eq('provider', 'payme').eq('external_id', trans_id).single();
          if (raced) return rpcResult(id, { create_time: new Date(raced.created_at).getTime(), transaction: raced.id, state: 1 });
        }
        return rpcError(id, ERR.CANT_PERFORM);
      }
      return rpcResult(id, { create_time: time, transaction: ins.data.id, state: 1 });
    }

    case 'PerformTransaction': {
      const { id: trans_id } = params;
      const { data: row } = await sb.from('payments')
        .select('*').eq('provider', 'payme').eq('external_id', trans_id).maybeSingle();
      if (!row) return rpcError(id, ERR.TRANS_NOT_FOUND);

      // Idempotent: Payme retries this call over flaky networks. If we
      // already performed it, return the same result instead of granting
      // the subscription a second time.
      if (row.status === 'paid') {
        return rpcResult(id, { transaction: row.id, perform_time: new Date(row.updated_at).getTime(), state: 2 });
      }

      // A missing plan must fail the transaction, not silently grant the
      // most expensive one — this is real money and a real subscription.
      const plan = row.raw?.account?.plan;
      if (!plan) return rpcError(id, ERR.CANT_PERFORM);

      // payments/subscriptions/profiles writes happen together in one
      // transaction (see perform_payment() migration) — no partial state
      // if the function dies mid-way.
      const performTime = Date.now();
      const { error: performErr } = await sb.rpc('perform_payment', { p_payment_id: row.id, p_plan: plan });
      if (performErr) return rpcError(id, ERR.CANT_PERFORM);

      return rpcResult(id, { transaction: row.id, perform_time: performTime, state: 2 });
    }

    case 'CancelTransaction': {
      const { id: trans_id, reason } = params;
      const { data: row } = await sb.from('payments')
        .select('*').eq('provider', 'payme').eq('external_id', trans_id).maybeSingle();
      if (!row) return rpcError(id, ERR.TRANS_NOT_FOUND);

      // Payme's protocol distinguishes cancelling a still-pending transaction
      // (state -1) from cancelling one that was already performed — that's a
      // refund, state -2. Returning -1 unconditionally fails their
      // conformance tests and misreports refunds as plain cancellations.
      const wasPerformed = row.status === 'paid';
      const newStatus = wasPerformed ? 'refunded' : 'cancelled';
      await sb.from('payments').update({ status: newStatus, raw: { ...(row.raw || {}), cancel_reason: reason } }).eq('id', row.id);

      return rpcResult(id, { transaction: row.id, cancel_time: Date.now(), state: wasPerformed ? -2 : -1 });
    }

    case 'CheckTransaction': {
      const { id: trans_id } = params;
      const { data: row } = await sb.from('payments')
        .select('*').eq('provider', 'payme').eq('external_id', trans_id).maybeSingle();
      if (!row) return rpcError(id, ERR.TRANS_NOT_FOUND);
      const stateMap = { pending: 1, paid: 2, cancelled: -1, failed: -2, created: 1, refunded: -2 } as const;
      return rpcResult(id, {
        transaction: row.id,
        create_time: new Date(row.created_at).getTime(),
        perform_time: row.status === 'paid'      ? new Date(row.updated_at).getTime() : 0,
        cancel_time:  row.status === 'cancelled' ? new Date(row.updated_at).getTime() : 0,
        state: stateMap[row.status] ?? 1,
        reason: row.raw?.cancel_reason ?? null,
      });
    }

    case 'GetStatement': {
      const { from, to } = params;
      const { data: rows } = await sb.from('payments')
        .select('*').eq('provider', 'payme')
        .gte('created_at', new Date(from).toISOString())
        .lte('created_at', new Date(to).toISOString());
      return rpcResult(id, { transactions: rows ?? [] });
    }

    default:
      return rpcError(id, { code: -32601, message: { en: 'Method not found' } });
  }
});
