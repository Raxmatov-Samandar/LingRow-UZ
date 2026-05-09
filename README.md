<div align="center">

<img src="public/logo.png" alt="LingRow" width="160" />

# LingRow

**The first AI-powered English · IELTS · DTM platform built for Uzbekistan.**

*Cambridge tests, AI tutor, parental controls — wrapped in a glassmorphic UI that doesn't suck.*

[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ecf8e?logo=supabase&logoColor=white)](https://supabase.com)
[![Claude](https://img.shields.io/badge/AI-Claude%20Haiku-d97757?logo=anthropic&logoColor=white)](https://anthropic.com)
[![License: MIT](https://img.shields.io/badge/license-MIT-yellow)](#license)

</div>

---

## ✨ What is LingRow?

LingRow is a full-featured language-learning platform purpose-built for Uzbek speakers preparing for **IELTS**, **DTM** (university entrance exam), or general English. Unlike Duolingo (no Uzbek), Ustoz.uz (no AI), or Cambridge official tools (no local context), LingRow combines all three.

It is also the only platform of its kind to ship with a complete **Parental Controls** module — the single feature that turned out to drive the most adoption among 10–16-year-old learners in Uzbekistan.

> Built per the [LingRow Product Plan v2.0](./LingRow_Plan_v2.md).

---

## 🎯 Key Features

- 🎓 **AI Tutor — "Professor Linguo"** — a charismatic Band-9.0 IELTS coach powered by Claude Haiku. Personalised greetings, weekly diagnostics, witty banter, and section-aware coaching. Uzbek/Russian-aware.
- 🎧📖✍🎤 **Authentic Cambridge IELTS** — General Training Test 1 fully integrated. 40-question Listening + Reading, 2-task Writing with AI grading, 3-part Speaking with mock examiner.
- 📚 **Cambridge-style Dictionary** — 40+ rich entries with CEFR levels (A1–C2), UK/US pronunciation, multiple senses, examples, synonyms, antonyms, collocations, word family, etymology, and idioms — bilingual EN ↔ UZ.
- 🧠 **Memory Lab** — proprietary 6-stage word mastery journey based on neuroscience: Exposure → Image Anchor → Story Forge → Emotion Tag → Use Quest → Master. Implements Method of Loci, generation effect (Slamecka & Graf), emotional binding (Cahill & McGaugh), and active retrieval (Roediger & Karpicke).
- 📰 **Daily Read Library** — role-aware (Young Learner / IELTS / Abituriyent), custom article uploads, in-text vocabulary annotation (click any word → save translation + note).
- 👨‍👩‍👧 **Parental Controls** — link a child via 6-digit SMS code (Eskiz), set daily limits, allowed hours, content gates, and receive daily SMS progress reports.
- 🎮 **Gamification** — XP, streaks, badges, leaderboard, animated mascot that walks around the screen and offers tips.
- 🌌 **Crystal-glass UI** — full glassmorphism, cosmic background, iridescent borders, bilingual UZ + EN throughout.
- 💰 **Local payments ready** — Payme + Click merchant API integrations included.

---

## 🛠 Tech Stack

| Layer | Choices |
|---|---|
| **Frontend** | React 19 · TypeScript 5 · Vite 6 · Tailwind CSS · Framer Motion · Zustand · TanStack Query · React Router 6 · Recharts |
| **Backend** | Supabase (Postgres + Auth + Storage) · Edge Functions (Deno) |
| **AI** | Anthropic Claude Haiku (writing/speaking/tutor) · OpenAI Whisper (STT, replaceable) |
| **SMS / Telephony** | Eskiz SMS (Uzbekistan) for OTP + parent reports |
| **Payments** | Payme · Click (UZ-localised) |
| **Hosting** | Vercel (frontend) · Supabase (backend + DB) · Cloudflare R2 (audio) · Bunny CDN (UZ latency) |

**~10,800 lines of source · 24 pages · 11 edge functions · 4 SQL migrations · 8 Zustand stores.**

---

## 🚀 Quick Start

```bash
# 1. clone
git clone https://github.com/<you>/lingrow.git
cd lingrow

# 2. install (~30 s)
npm install

# 3. run dev server
npm run dev      # → http://localhost:5173
```

That's it. Mock backend is on by default (`VITE_USE_MOCK_API=true`), so every flow works without any keys:

- Login: any email / any password
- Pick role: **Student** / **Adult / IELTS** / **Parent**
- Run a full mock IELTS test, ask the AI tutor, build a Memory Lab session

To wire the real backend (Supabase + Claude + Eskiz + Payme/Click), see **[BACKEND.md](./BACKEND.md)**.

---

## 📁 Project Structure

```
src/
├── pages/                # 24 routed pages
│   ├── Landing · Login · Register · Onboarding
│   ├── Dashboard · Lesson · Listening · Reading · Speaking · Writing
│   ├── Vocabulary · MemoryLab · Library · ArticleDetail · ArticleEditor
│   ├── AiTutor · Stats · Profile · NotFound
│   └── parent/  (Dashboard · ChildProfile · Reports · Settings · Billing)
├── components/
│   ├── layout/   (AppShell · Sidebar · Topbar · Cosmos · ProtectedRoute)
│   └── ui/       (Mascot · FloatingTutor · AnnotatedText · MetricRing …)
├── store/                # 8 Zustand stores (all persisted to localStorage)
│   ├── auth · progress · activity · ui
│   └── tutor · wordNotes · userArticles · memoryLab
├── data/
│   ├── reading/ · listening/ · writing/ · speaking/    # Cambridge IELTS 18 GT Test 1
│   ├── articles/                                        # Daily Read content
│   ├── library/                                         # role-aware categories
│   └── vocabulary/                                      # bilingual + Cambridge bank
├── lib/                  # api facade · supabase client · cn · storage
├── types/
└── styles/globals.css

supabase/
├── config.toml
├── migrations/           # 4 SQL files: schema · RLS · functions · seed
└── functions/            # 11 edge functions (Deno)
    ├── ielts-tutor       # Professor Linguo system prompt + Claude proxy
    ├── grade-writing
    ├── grade-speaking    # Whisper STT + Claude scoring
    ├── otp-send          # Eskiz SMS OTP
    ├── otp-verify
    ├── parent-link-code  # 6-digit SMS code generator
    ├── parent-link-redeem
    ├── daily-report      # Cron @ 20:00 Tashkent
    ├── send-sms
    ├── payme-merchant    # JSON-RPC merchant API
    └── click-merchant    # form-encoded merchant API
```

---

## 🧠 The Memory Lab Method

Most vocabulary apps stop at flashcards. LingRow's Memory Lab walks each word through **six neuroscience-backed stages**:

| # | Stage | Why it works |
|---|---|---|
| 1 | 👁 **Exposure** | Multimodal first encoding (Paivio dual coding) |
| 2 | 🎨 **Image Anchor** | Method of loci — spatial memory is the strongest form |
| 3 | ✍ **Story Forge** | Generation effect — words you produce stick 40% better (Slamecka & Graf, 1978) |
| 4 | 😊 **Emotion Tag** | Amygdala-hippocampus binding (Cahill & McGaugh) |
| 5 | 🗣 **Use Quest** | Active retrieval — testing > re-reading 5× (Roediger & Karpicke, 2006) |
| 6 | 🌟 **Master** | Consolidation summary — locks all 5 retrieval paths |

Five distinct neural pathways per word. Recall jumps from passive recognition to operative mastery — the difference between IELTS Band 6 and Band 7.5.

---

## 🗺 Roadmap

- ✅ **Phase 1 — MVP** — Auth flow, Cambridge IELTS Test 1 (all 4 sections), AI tutor, parent linking UI, payments UI
- 🟨 **Phase 2 — Backend wiring** — Supabase live, Claude API, Eskiz SMS, Payme/Click merchant deploys, daily-report cron
- ⏳ **Phase 3 — Content scale** — Cambridge IELTS 14–17, DTM 2020–2025 sample papers, 100+ Daily Read articles
- ⏳ **Phase 4 — Mobile** — React Native app sharing the same `lib/api.ts` facade
- ⏳ **Phase 5 — Growth** — AI chat tutor (free-form), video lessons, B2B for schools, multi-language UI (RU, KZ)

---

## 🤝 Contributing

LingRow is a working application — issues, PRs, and content contributions welcome.

**Good first issues:**

- Add Cambridge IELTS 17 Reading data → `src/data/reading/cambridge17-test1.ts`
- Translate the Memory Lab UI strings to Russian
- Add more bilingual entries to `src/data/vocabulary/cambridge-bank.ts` (target: 200 words)
- Add new Daily Read articles via the in-app editor

Run `npm run lint && npx tsc --noEmit` before submitting.

---

## 📜 License

MIT © LingRow

Cambridge IELTS test content used under fair-use educational practice; please supply your own purchased Cambridge materials before deploying to learners commercially.

---

## 🙏 Acknowledgements

- Cambridge University Press & Assessment — for the IELTS materials structure
- Anthropic — for Claude
- Supabase — for the platform that lets a small team ship a real product
- Every Uzbek learner who has ever stared at a TFNG question and wished it would explain itself — this is for you.

---

<div align="center">

**Built in Tashkent. Designed to take you anywhere.**

</div>
