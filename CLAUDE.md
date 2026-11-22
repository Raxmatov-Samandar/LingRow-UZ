# LingRow — Claude Code Context

> **2026-11-23 eslatma:** Android ilova endi Flutter'da (`../lingrow_flutter`). Umumiy kontekst,
> imzolash holati va checkpoint jurnali: `../CLAUDE.md` va `../CHECKPOINT.md`. Bu fayl faqat veb
> (React) versiya uchun.

> AI-powered English / IELTS / DTM learning platform for Uzbekistan.
> Keep this file up to date so future Claude sessions get oriented in seconds.

## Quick facts

- **Stack:** React 19 + TypeScript 5 + Vite 6 + Tailwind CSS + Framer Motion + Zustand + TanStack Query + React Router 6.
- **Backend:** Supabase (Postgres + Auth + Storage + Edge Functions in Deno). Mock mode (`VITE_USE_MOCK_API=true`) is the default for local dev.
- **i18n:** `i18next` + `react-i18next`. Default language **Uzbek**. EN + UZ namespaces in `src/i18n/locales/`.
- **Repo:** https://github.com/Raxmatov-Samandar/LingRow-UZ
- **Default branch:** `main`. Vercel auto-deploys on push.

## Run / dev

```bash
npm install
npm run dev          # http://localhost:5173 (binds to all interfaces — accessible from phone on same WiFi)
npx tsc --noEmit     # typecheck before committing
```

`.env` is gitignored. Required keys live in `.env.example`. For mock mode you only need:

```
VITE_USE_MOCK_API=true
VITE_DEV_EMAIL=raxmatovsamandar1507@gmail.com
VITE_DEV_PASSWORD=Rakhmatov7380
```

## Folder layout (annotated)

```
src/
├── pages/                     # one file per route
│   ├── Landing.tsx            # public hero + LandingFooter
│   ├── Login.tsx              # SeasonalLoginScene wrapper + form
│   ├── Register.tsx           # 4-role picker (student/adult/dtm/parent)
│   ├── Onboarding.tsx         # role-specific onboarding
│   ├── Dashboard.tsx          # student/adult home — single right sidebar card with stacked sections
│   ├── Lesson.tsx             # video + subtitle bar + vocab + Kahoot quiz
│   ├── Listening/Reading/Speaking/Writing.tsx
│   ├── Vocabulary.tsx + MemoryLab.tsx
│   ├── Library.tsx + ArticleDetail.tsx + ArticleEditor.tsx
│   ├── Stats.tsx + Profile.tsx + AiTutor.tsx
│   ├── Legal.tsx              # Privacy + Terms
│   ├── parent/                # ParentDashboard, ChildProfile, Reports, Settings, Billing
│   ├── dtm/                   # DtmHome + DtmSubjects (Math, English, Native, Mock, PastPapers, Stats)
│   └── dev/DevPanel.tsx       # gated by VITE_DEV_EMAIL — Audio/Articles/Books(PDF)/Lessons/Stats
│
├── components/
│   ├── layout/                # AppShell, Sidebar (mobile drawer + desktop), Topbar, Cosmos, LandingFooter
│   ├── login/                 # SeasonalLoginScene + SceneArt (4-season twilight illustration)
│   ├── lesson/LessonQuiz.tsx  # Kahoot-style vocabulary quiz overlay
│   ├── ui/                    # MediaPlayer, LanguageSwitcher, FloatingTutor, etc.
│
├── store/                     # Zustand stores (all use `persist` except mobileNavOpen)
│   ├── auth.ts                # user + onboarding + selectedRole
│   ├── progress.ts            # xp + streak
│   ├── activity.ts            # event log (lesson_completed, quiz_submitted…)
│   ├── ui.ts                  # sidebarCollapsed + mobileNavOpen
│   ├── devContent.ts          # dev-uploaded audio / books / lessons
│   └── tutor, memoryLab, userArticles, wordNotes
│
├── lib/
│   ├── api.ts                 # mock + real Supabase facade (auth, learning)
│   ├── dev.ts                 # isDevUser / isDevEmail (single-account gating)
│   ├── contacts.ts            # hellolingrow / lingrowsupport / legallingrow emails
│   ├── media.ts               # detectMedia(url) → YouTube/Vimeo/mp3/mp4 embed converter
│   ├── pdfParser.ts           # pdfjs-dist + heuristic Cambridge IELTS parser
│   ├── supabase.ts cn.ts utils.ts storage.ts
│
├── i18n/                      # i18next setup + en.ts + uz.ts
├── data/                      # static seed: cambridge IELTS test 1, vocabulary, articles, library
├── types/index.ts             # UserRole = 'student' | 'adult' | 'dtm' | 'parent'
└── styles/globals.css         # glass-panel, crystal-card, nav-item primitives + safe-area
```

## Roles & routing

- 4 roles in `UserRole` type: `student | adult | dtm | parent`.
- Login picks role → mock `signIn` honors it; real Supabase reads it from `profiles`.
- Post-login redirect: `parent → /parent`, `dtm → /dtm/home`, else `/home`.
- Routes are gated by `<ProtectedRoute roles={...} />` in `src/App.tsx`.

## Mobile

- `AppShell` switches sidebar between persistent (≥ 1024px) and slide-in drawer (< 1024px).
- All page grids use `lg:grid-cols-[...] grid-cols-1` to stack on mobile.
- Body uses `100dvh` + safe-area-inset; pinch-zoom disabled via viewport meta.
- iOS PWA meta tags in `index.html` so "Add to Home Screen" feels native.

## Git rules

- Author/committer is pinned to **Raxmatov Samandar** via local `.git/config`. Commit commands in this repo explicitly set `GIT_AUTHOR_*` and `GIT_COMMITTER_*` env vars too, because the harness sometimes injects a different identity:

```bash
GIT_AUTHOR_NAME="Raxmatov Samandar" \
GIT_AUTHOR_EMAIL="268301094+Raxmatov-Samandar@users.noreply.github.com" \
GIT_COMMITTER_NAME="Raxmatov Samandar" \
GIT_COMMITTER_EMAIL="268301094+Raxmatov-Samandar@users.noreply.github.com" \
git commit -m "..."
```

- Commit message style: short imperative subject, optional body in present tense.
- Never push secrets — `.env` and `*.tsbuildinfo` are gitignored.

## Active conventions

- **Immutability:** prefer new objects over mutation (per global rules).
- **i18n every UI string:** add keys to both `en.ts` and `uz.ts`. IELTS section names (Listening / Reading / Speaking / Writing) stay in English on purpose.
- **Glass + crystal primitives:** reuse `.glass-panel` and `.crystal-card` from `globals.css` instead of bespoke shadows.
- **Animations:** prefer `ease-out cubic-bezier(0.23,1,0.32,1)` or framer-motion springs. Honor `prefers-reduced-motion`.
- **No emojis in code/files** unless the user asks. UI may use them.
- **Buttons feel responsive:** `:active` → `scale(0.97)` (Emil Kowalski rule).

## Project boundaries

- **Never touch AliBrandUZ-crm code from this project.** The two repos must not share files, env vars, or commits.
- AliBrandUZ-crm lives at `C:\AliBrandUZ-crm` — completely separate Supabase project, completely separate codebase.

## Things the user keeps coming back to

- **Dev Panel** (`/dev`) — uploads happen through here. Books tab uses `pdfjs-dist` to parse PDFs and apply a heuristic Cambridge-IELTS structure.
- **Seasonal login scene** — auto-picks season from current month; user can switch manually via the top-left chip cluster. Don't ship cartoon blobs; use the SVG illustrations in `SceneArt.tsx`.
- **DTM track** — 3 subjects only: Mathematics, English, Native language (Ona tili va Adabiyot). Plus Mock Tests + Past Papers + Stats. There is no DTM listening section.
- **Lesson quiz** — Kahoot-style overlay. Red triangle / blue diamond / yellow circle / green square. 18s per question, points scale with remaining time.
- **Brand contact emails:** `EMAIL_HELLO`, `EMAIL_SUPPORT`, `EMAIL_LEGAL` in `src/lib/contacts.ts` — single source of truth.

## Mobile app (Capacitor)

Android + iOS ship from this repo via Capacitor (`android/`, `ios/`); package id
`uz.lingrow.app`. Build notes, keystore location and Windows workarounds:
`C:\Users\raxma\lingrow-android\README.md`. **Never commit the keystore.**

> **Do not un-gate payments in the native app.** `src/lib/platform.ts` exposes
> `canShowPayments()`, which is false inside Capacitor. Both the sidebar entry and the
> `/parent/billing` route are gated by it. Google Play requires digital subscriptions to
> go through Play Billing — the Payme/Click checkout would be a policy violation in the
> Android app. Wire Play Billing first, then re-enable.

## Open tasks

- [ ] **Google Play Billing** — required before payments can be re-enabled in the Android app.
- [ ] Wire parsed dev-books → Reading page test selector (let users take the parsed PDF as an interactive Cambridge-style test).
- [ ] Real Anthropic API key wiring for AI parsing (currently heuristic only).
- [ ] DTM content ingestion via Dev Panel once user uploads PDFs.
- [ ] `SceneArt.tsx` logs invalid SVG `preserveAspectRatio` values (`xMidYEnd` / `xMinYEnd`
      aren't valid — should be `…YMax`). Cosmetic, but noisy in the console.

### Done (previously listed as open)

- [x] Stats page → now reads the real activity store.
- [x] Speaking page → real `MediaRecorder` implemented.
- [x] Cambridge listening audio → moved to Supabase Storage (uploaded via Dev Panel),
      so there is no `/public/audio/` directory by design.

## When you're stuck

- Codebase questions → grep first; the file layout above tells you which folder to look in.
- Translation missing → add to BOTH `en.ts` and `uz.ts`, keep keys nested by feature.
- Type errors → `npx tsc --noEmit` and address one at a time.
- Mobile breakage → check the grid uses `lg:grid-cols-...` and the page doesn't assume `h-screen` (use `h-[100dvh]` or `flex-1`).
