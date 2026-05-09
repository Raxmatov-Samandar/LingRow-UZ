# LingRow — Backend setup guide

End-to-end recipe to take this repository from the mock demo to a fully functional
production deployment. Architecture follows Plan v2:

```
                                              ┌────────────────┐
                                          ┌──▶│  Anthropic     │ Claude Haiku
                                          │   └────────────────┘
                                          │   ┌────────────────┐
                                          ├──▶│  OpenAI Whisper │ STT
   ┌──────────────────┐                   │   └────────────────┘
   │  React frontend   │  HTTPS            │   ┌────────────────┐
   │  (Vercel)         │ ────────────┐     ├──▶│  Eskiz SMS     │
   └──────────────────┘             │     │   └────────────────┘
              │                     ▼     │   ┌────────────────┐
              │       ┌──────────────────┐ │   │  Payme         │
              ├──────▶│ Supabase Edge     │─┤   └────────────────┘
              │       │ Functions (Deno)  │ │   ┌────────────────┐
              │       └──────────────────┘ └──▶│  Click         │
              │                ▲              └────────────────┘
              ▼                │
   ┌──────────────────┐  ┌──────────────────┐
   │ Supabase Auth    │  │ Postgres + RLS    │
   │ (email/Google)   │  │ + cron + storage  │
   └──────────────────┘  └──────────────────┘
```

---

## 0. Prerequisites

- **Node 18+** (we run Node 25 in dev)
- **Supabase account** (free tier OK to start)
- **Supabase CLI** — `npm i -g supabase` or `scoop install supabase`
- **Anthropic API key** (https://console.anthropic.com/)
- **OpenAI API key** *(only for Whisper STT — replaceable with another STT)*
- **Eskiz.uz account** — request a sender ID, free trial gives 200 SMS
- **Payme merchant account** — https://business.payme.uz
- **Click merchant account** — https://merchant.click.uz

---

## 1. Create the Supabase project

```bash
# log in
supabase login

# link this repository to your remote project
supabase link --project-ref <your-ref>     # ref shown in your dashboard URL
```

Copy the URL + anon key into `.env`:

```
VITE_SUPABASE_URL=https://<ref>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
VITE_USE_MOCK_API=false
```

---

## 2. Run the database migrations

```bash
supabase db push                     # applies supabase/migrations/0001..0004
```

Verify in the Studio:

- Tables: `profiles`, `progress`, `lessons`, `vocab_words`, `user_vocab`,
  `quiz_questions`, `user_quiz_attempts`, `ai_feedback`, `parent_profiles`,
  `parent_children`, `parental_controls`, `daily_reports`, `otp_codes`,
  `sms_log`, `subscriptions`, `payments`.
- RLS enabled on every user-data table.
- Trigger `on_auth_user_created` fires `handle_new_user()`.

Optional: skip the seed file in production — `supabase db push --include-seed=false`.

---

## 3. Configure Auth

In *Supabase Studio → Authentication → Settings*:

- **Site URL:** `https://app.lingrow.uz` (or `http://localhost:5173` for dev)
- **Email confirmations:** ON for production, OFF in dev
- **Enable Google provider:** add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- **Phone provider:** leave OFF (we use Eskiz via custom edge function)

---

## 4. Create the Storage bucket for speaking audio

```sql
insert into storage.buckets (id, name, public) values ('speaking', 'speaking', false);
```

Add a policy so users can read their own files:

```sql
create policy "speaking own files"
on storage.objects for select
using (bucket_id = 'speaking' and (storage.foldername(name))[1] = auth.uid()::text);
```

---

## 5. Set edge-function secrets

```bash
# AI
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase secrets set OPENAI_API_KEY=sk-...

# Eskiz
supabase secrets set ESKIZ_EMAIL=user@example.com
supabase secrets set ESKIZ_PASSWORD=*****
supabase secrets set ESKIZ_FROM=4546

# OTP
supabase secrets set OTP_SALT=$(openssl rand -hex 16)

# Daily report cron
supabase secrets set DAILY_REPORT_SECRET=$(openssl rand -hex 16)

# Payments
supabase secrets set PAYME_MERCHANT_KEY=*****
supabase secrets set CLICK_SECRET=*****
```

---

## 6. Deploy the edge functions

```bash
supabase functions deploy grade-writing
supabase functions deploy grade-speaking
supabase functions deploy otp-send
supabase functions deploy otp-verify
supabase functions deploy parent-link-code
supabase functions deploy parent-link-redeem
supabase functions deploy daily-report
supabase functions deploy send-sms
supabase functions deploy payme-merchant
supabase functions deploy click-merchant
```

After deploy, the URLs follow the pattern:
`https://<ref>.supabase.co/functions/v1/<name>`.

### Public callbacks for payment providers

Give Payme:
- **Endpoint URL:** `https://<ref>.supabase.co/functions/v1/payme-merchant`
- **Login:** `Paycom`
- **Password:** the value of `PAYME_MERCHANT_KEY`

Give Click:
- **Prepare URL:** `https://<ref>.supabase.co/functions/v1/click-merchant`
- **Complete URL:** same
- **Secret:** value of `CLICK_SECRET`

---

## 7. Schedule the daily report

Use Supabase Cron (Studio → Cron) or `pg_cron`:

```sql
select
  cron.schedule(
    'lingrow-daily-report',
    '0 15 * * *',                         -- 15:00 UTC = 20:00 Asia/Tashkent
    $$
      select net.http_post(
        url    := 'https://<ref>.supabase.co/functions/v1/daily-report',
        headers := jsonb_build_object('X-Cron-Secret', '<DAILY_REPORT_SECRET>')
      );
    $$
  );
```

Verify by manually invoking once:

```bash
curl -H "X-Cron-Secret: $DAILY_REPORT_SECRET" \
     -X POST https://<ref>.supabase.co/functions/v1/daily-report
```

---

## 8. Frontend deploy (Vercel)

```bash
# from project root
vercel link
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_USE_MOCK_API false
vercel env add VITE_PAYME_MERCHANT_ID
vercel env add VITE_CLICK_MERCHANT_ID
vercel env add VITE_CLICK_SERVICE_ID
vercel deploy --prod
```

Vercel auto-detects Vite. The framework preset is **Vite**, the build command
`npm run build`, output dir `dist`.

Optional: configure a custom domain (`app.lingrow.uz`) in Vercel → Domains.

---

## 9. Smoke tests

| Flow                                                | Endpoint                          | Pass when |
|-----------------------------------------------------|-----------------------------------|-----------|
| Email sign-up → trigger creates profile + progress | Supabase Auth                     | row visible in `profiles` |
| Phone sign-in → SMS arrives                         | `otp-send`                        | SMS received in seconds   |
| OTP verify → user signed in                         | `otp-verify`                      | session token returned    |
| Parent generates code → child redeems               | `parent-link-code` + `-redeem`    | `parent_children.is_active = true` |
| Writing graded by AI                                | `grade-writing`                   | row appended to `ai_feedback` |
| Speaking graded                                      | `grade-speaking`                  | audio uploaded to `speaking/` bucket; transcript returned |
| Cron at 20:00                                       | `daily-report`                    | new rows in `daily_reports`; SMS to parent |
| Payme test → callback                               | `payme-merchant`                  | `payments.status = paid`; `subscriptions` row added |
| Click test → callback                               | `click-merchant`                  | same as above             |

---

## 10. Hardening checklist

- [ ] Rotate `SUPABASE_SERVICE_ROLE_KEY` if it ever leaks. (Edge functions only.)
- [ ] Cap Anthropic spend — set per-month soft limit in your dashboard.
- [ ] Throttle `otp-send` further if abuse spotted (we already cap 3/10min/phone).
- [ ] Set `auth.email.double_confirm_changes = true` in `config.toml` (already on).
- [ ] Run `supabase db lint` periodically to catch missing RLS.
- [ ] Configure Vercel deploy protection so preview URLs aren't public.
- [ ] Audit log: enable Postgres `pgaudit` extension for compliance.

---

## 11. Frequently-needed SQL queries

```sql
-- Linked children for a parent
select c.name, c.age, c.email
from parent_profiles pp
join parent_children pc on pc.parent_id = pp.id
join profiles c on c.id = pc.child_id
where pp.user_id = auth.uid() and pc.is_active;

-- Today's report for one child
select * from daily_reports where child_id = '...' and date = current_date;

-- SM-2 cards due to review
select w.word, w.phonetic, uv.next_review
from user_vocab uv
join vocab_words w on w.id = uv.word_id
where uv.user_id = auth.uid() and uv.next_review <= now()
order by uv.next_review;

-- Revenue last 30 days
select sum(amount_uzs)/100 as som
from payments
where status='paid' and created_at > now() - interval '30 days';
```

---

## 12. What's intentionally not in this repo

- **Mobile app** — separate React Native project (Plan v2 Faza 2). Use the same
  `src/lib/api.ts` and `src/lib/supabase.ts` as a starting point.
- **Admin dashboard** — recommended next iteration. Use Supabase Studio for now.
- **Monitoring** — recommend Sentry for the SPA + Logtail/Better Stack for
  edge-function logs.
