// =============================================================================
// API layer — single facade for the entire frontend.
//   - Mocks when VITE_USE_MOCK_API=true OR Supabase env vars missing
//   - Calls real Supabase + Edge Functions otherwise
// =============================================================================
import type {
  User, Lesson, VocabWord, QuizQuestion, Badge, LeaderboardEntry,
  ParentChild, ParentalControls, DailyReport, UserRole,
} from '@/types';
import {
  LEVELS, VOCAB, QUIZ, BADGES, LEADERBOARD,
  PARENT_CHILDREN, PARENTAL_CONTROLS, DAILY_REPORTS,
} from '@/data/mock';
import { supabase, isSupabaseConfigured } from './supabase';
import { isDevEmail, DEV_PASSWORD } from './dev';

const useMock = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true' || !isSupabaseConfigured();
const wait    = (ms = 250) => new Promise(r => setTimeout(r, ms));

/** Helper: call a Supabase edge function with auth token. */
async function fn<T>(name: string, body?: unknown, init: RequestInit = {}): Promise<T> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data: { session } } = await supabase.auth.getSession();
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${name}`;
  const res = await fetch(url, {
    method:  init.method ?? 'POST',
    headers: {
      'Content-Type':  body instanceof FormData ? '' : 'application/json',
      Authorization:   session?.access_token ? `Bearer ${session.access_token}` : `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      apikey:          import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
      ...(init.headers ?? {}),
    },
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

// ----------------------- AUTH -----------------------

export const auth = {
  async signIn(email: string, password: string, role: UserRole = 'student'): Promise<User> {
    if (useMock) {
      await wait();
      // Dev-account guard: in mock mode, the dev email is locked behind a
      // specific password configured via VITE_DEV_PASSWORD. Other emails
      // accept anything (it's still a demo).
      if (isDevEmail(email)) {
        if (!DEV_PASSWORD || password !== DEV_PASSWORD) {
          throw new Error('Invalid credentials.');
        }
      }
      // Mock honours the role chosen on the Login screen so the demo lands on
      // the right dashboard. Real Supabase ignores this — the role comes from
      // the profiles row.
      return makeDemoUser(email, role);
    }
    const { data, error } = await supabase!.auth.signInWithPassword({ email, password });
    if (error || !data.user) throw error ?? new Error('Sign-in failed');
    return await loadProfile(data.user.id);
  },

  async signUp(opts: { name: string; email: string; password: string; role: UserRole; age?: number }): Promise<User> {
    if (useMock) {
      await wait();
      // Block someone else from signing up under the dev email.
      if (isDevEmail(opts.email)) {
        throw new Error('This email is reserved.');
      }
      return { ...makeDemoUser(opts.email, opts.role), name: opts.name, age: opts.age };
    }
    const { data, error } = await supabase!.auth.signUp({
      email: opts.email,
      password: opts.password,
      options: { data: { name: opts.name, role: opts.role, age: opts.age } },
    });
    if (error || !data.user) throw error ?? new Error('Sign-up failed');
    // Trigger handle_new_user creates the profile row.
    return await loadProfile(data.user.id);
  },

  async signInWithOAuth(provider: 'google' = 'google') {
    if (useMock) throw new Error('OAuth requires real Supabase');
    return supabase!.auth.signInWithOAuth({ provider });
  },

  async sendOtp(phone: string) {
    if (useMock) { await wait(); console.info('[mock] OTP 123456 sent to', phone); return { ok: true }; }
    return fn<{ ok: true }>('otp-send', { phone });
  },

  async verifyOtp(phone: string, code: string) {
    if (useMock) { await wait(); return { ok: code === '123456' }; }
    return fn<{ ok: boolean; action_link?: string }>('otp-verify', { phone, code });
  },

  async signOut() { if (!useMock && supabase) await supabase.auth.signOut(); },
};

async function loadProfile(userId: string): Promise<User> {
  const { data, error } = await supabase!.from('profiles').select('*').eq('id', userId).single();
  if (error || !data) throw error ?? new Error('Profile not found');
  return {
    id: data.id, name: data.name, email: data.email, phone: data.phone,
    role: data.role, age: data.age, plan: data.plan, avatarUrl: data.avatar_url,
    createdAt: data.created_at,
  };
}
function makeDemoUser(email: string, role: UserRole): User {
  return {
    id: 'demo-user',
    name: email.split('@')[0] || 'Demo User',
    email,
    role,
    age: role === 'student' ? 14 : role === 'adult' ? 22 : role === 'dtm' ? 17 : 38,
    plan: role === 'student' ? 'teen' : role === 'adult' ? 'ielts' : role === 'dtm' ? 'dtm' : 'family',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    createdAt: new Date().toISOString(),
  };
}

// ----------------------- LESSONS / VOCAB / QUIZ -----------------------

export const learning = {
  async getLevels(): Promise<Lesson[]> {
    if (useMock) { await wait(); return LEVELS; }
    const { data } = await supabase!.from('lessons').select('*').order('order_index');
    // Group by level → first lesson per level becomes the "level card".
    const byLevel: Record<string, Lesson> = {};
    for (const row of data ?? []) {
      if (!byLevel[row.level]) {
        byLevel[row.level] = {
          id: row.level, title: row.level[0].toUpperCase() + row.level.slice(1),
          level: row.level, totalLessons: 0, completedLessons: 0,
          type: row.type, description: 'Crystal glass texture',
        };
      }
      byLevel[row.level].totalLessons += 1;
    }
    return Object.values(byLevel);
  },

  async getVocab(): Promise<VocabWord[]> {
    if (useMock) { await wait(); return VOCAB; }
    const { data } = await supabase!.from('vocab_words').select('*');
    return (data ?? []).map(w => ({
      id: w.id, word: w.word, phonetic: w.phonetic, definition: w.definition,
      example: w.example, level: w.level,
      sm2: { easeFactor: 2.5, interval: 1, repetitions: 0, nextReview: new Date().toISOString() },
    }));
  },

  async reviewVocab(wordId: string, quality: 0|1|2|3|4|5) {
    if (useMock) { await wait(); return; }
    const { data: { user } } = await supabase!.auth.getUser();
    if (!user) throw new Error('not authenticated');
    await supabase!.rpc('sm2_review', { p_user: user.id, p_word: wordId, p_quality: quality });
  },

  async getQuiz(lessonId?: string): Promise<QuizQuestion[]> {
    if (useMock) { await wait(); return QUIZ; }
    const q = supabase!.from('quiz_questions').select('*').order('order_index');
    const { data } = lessonId ? await q.eq('lesson_id', lessonId) : await q;
    return (data ?? []).map(r => ({
      id: r.id, prompt: r.prompt, options: r.options,
      correctIndex: r.correct_index, explanation: r.explanation,
    }));
  },

  async submitQuiz(opts: { lessonId: string; answers: number[] }): Promise<{ score: number; correct: number; total: number; bandScore?: number }> {
    if (useMock) { await wait(); return { score: 75, correct: 3, total: 4, bandScore: 6.5 }; }
    const questions = await this.getQuiz(opts.lessonId);
    const correct   = questions.filter((q, i) => q.correctIndex === opts.answers[i]).length;
    const score     = (correct / questions.length) * 100;
    const bandScore = +(4.5 + (score / 100) * 4.5).toFixed(1);
    const { data: { user } } = await supabase!.auth.getUser();
    if (user) {
      await supabase!.from('user_quiz_attempts').insert({
        user_id: user.id, lesson_id: opts.lessonId,
        score, total: questions.length, correct,
        answers: opts.answers, band_score: bandScore,
      });
      await supabase!.rpc('award_xp', { p_user: user.id, p_xp: correct * 10 });
    }
    return { score, correct, total: questions.length, bandScore };
  },

  // ---- AI graders (proxied through edge functions) ----
  async gradeWriting(text: string, prompt?: string) {
    if (useMock) {
      await wait(600);
      return {
        score: 93, accuracy: 98, fluency: 95, pronunciation: 92,
        feedback: [
          'Subject-Verb Agreement: well done.',
          'Vocabulary suggestion: "pivotal" or "imperative" instead of "crucial".',
          'Style: vary sentence openings.',
        ],
      };
    }
    return fn<{ score: number; accuracy: number; fluency: number; pronunciation: number; feedback: string[] }>('grade-writing', { text, prompt });
  },

  async gradeSpeaking(audio: Blob, target: string) {
    if (useMock) {
      await wait(800);
      return { accuracy: 98, fluency: 95, pronunciation: 92, transcript: target, tip: `Great pronunciation of "${target}"! Try slowing down a touch on "practice".` };
    }
    const fd = new FormData();
    fd.append('audio', audio, 'audio.webm');
    fd.append('target', target);
    return fn<{ accuracy: number; fluency: number; pronunciation: number; transcript: string; tip: string }>('grade-speaking', fd);
  },
};

// ----------------------- AI TUTOR (Professor Linguo) -----------------------

export interface TutorChatMsg { role: 'user' | 'assistant'; content: string; }

// ── Mock reply banks ─────────────────────────────────────────────────────────
const MOCK_GREETINGS = [
  `Salom, salom! 👋 *adjusts imaginary monocle*\n\nProfessor Linguo at your service. I've had three cups of black tea and I'm dangerously caffeinated — perfect mood for grammar.\n\nHow's the brain today — fresh and shiny, or running on fumes? Either way, I can work with it. What shall we tackle?`,
  `Hello, hello, hello! 🎩\n\nGood to see you. I was just rereading Cambridge 17 — Section 4 had a tomato-farming disaster you'd love. (Or hate. Mostly hate.)\n\nHow are you feeling about your studies right now — confident, panicking, or somewhere in the "vaguely terrified but functional" zone?`,
  `Hey hey 👋 — top of the morning, evening, or whatever planet you're currently on.\n\nQuick weather report from my side: chance of bad puns, 80%; chance of useful IELTS advice, 100%.\n\nWhat's on your mind today? Could be a essay, could be "why is English spelling like this" — I'm here for both.`,
];

const MOCK_HOWAREYOU = [
  `Thank you for asking — that's already Band 7 social fluency right there. 😏\n\nI'm well — slightly haunted by a Task 2 prompt I read this morning ("Some people believe robots will replace teachers — discuss") but otherwise glorious.\n\nMore importantly: **how are *you*?** Sleep? Coffee? Stress level on a scale from 1 to "exam tomorrow"?`,
  `Brilliant, thanks — currently dunking biscuits and judging comma splices. Living the dream.\n\nAnd you? If you say "fine, thanks" I will gently force you to upgrade to **"absolutely thriving", "running on caffeine and ambition"** or **"like a ship in a storm — but the ship is brave"**. We're not Band 5 here, my friend. ✨`,
];

const MOCK_JOKES = [
  `Right, you asked for it. 😈\n\n*Why did the comma break up with the apostrophe?*\nBecause it couldn't handle the **possessiveness**. 🥁\n\nAnd a bonus, since you've been good:\n*An Oxford comma walks into a bar, has a drink, and leaves.*\n\nThe comedy is in the punctuation. You'll either laugh or unfollow me — both valid.`,
  `Okay okay — language nerd version:\n\n> The past, the present and the future walked into a bar.\n> It was **tense**.\n\nI'll see myself out. 🚪\n\n(But also, if you can explain WHY that's funny in English, you've just demonstrated awareness of polysemy and that's — no exaggeration — Band 7.5 vocabulary thinking.)`,
];

const MOCK_ABOUT_ME = [
  `Glad you asked. *Pours imaginary brandy.*\n\nI'm **Professor Linguo** — Band 9.0 across all four sections (yes, including Speaking, which still feels like a miracle). I've coached learners from Tashkent to Toronto, and my proudest win was a student who jumped from 4.5 to 7.5 in 11 weeks — by *deleting* half the words from his essays. Less, but better.\n\nMy actual passion? Etymology. Did you know "**salary**" comes from the Latin *sal* — salt? Roman soldiers got paid in it. So technically every payday is a salt-day. Anyway, I'll stop. What's *your* story?`,
];

const MOCK_MOTIVATION = [
  `Listen. 🫶\n\nEvery single learner who ever hit Band 8 had a week where they wanted to throw their study book out the window. Probably more than one. The difference between them and the ones who plateaued isn't talent — it's *deciding to come back tomorrow anyway*.\n\nYou don't need a perfect day. You need 25 minutes today. Read one passage. Time yourself. Note 3 paraphrases. That's it.\n\nThe band score doesn't care about your mood — only your reps. And you've got reps in you. 💪`,
];

const MOCK_IELTS = [
  `Right, let's see what we're working with! 🎯\n\n**Quick win:** your control of complex sentences is genuinely strong — that's already pushing you toward **Band 6.5+** territory.\n\n**The #1 fix:** swap "very important" for **"imperative"** or **"pivotal"**. Examiners reward precise lexis far more than long words used wrong.\n\n**Today's micro-action (5 min):** rewrite your last paragraph using exactly two of these: *imperative, pivotal, ubiquitous, ephemeral*.\n\nReady to try a Task 2 prompt? I've got a juicy one about social media. 😈`,
  `Lovely. Now — and I say this with love — your introduction does that classic IELTS thing where it *gestures vaguely* at the topic. The examiner literally has a checklist. Let's give them what they want.\n\n**Estimated band on this draft: 5.5**\n• Task Achievement: 6 — position is clear-ish\n• Coherence & Cohesion: 5 — paragraphing is uneven\n• Lexical Resource: 5 — repetition of "important"\n• Grammar: 6 — solid, occasional comma splices\n\n**Tomorrow's mission:** rewrite ONLY the introduction. 3 sentences. Hook → paraphrase → thesis. That's it.\n\nDeal?`,
  `Aha — a Speaking Part 2 question! My favourite. 🎤\n\nLet me roleplay as your examiner. *Clears throat dramatically.*\n\n> "I'd like you to describe **a place you would like to visit**. You should say where it is, why you want to go there, what you would do there, and explain how you feel about it."\n\nYou have **1 minute** to prepare. Speak for **1–2 minutes**. Type your answer (or a rough script) and I'll grade you on Fluency, Lexis, Grammar, and Pronunciation guesses based on word choice.\n\nReady when you are. 🚀`,
  `Listening Section 4 is where dreams go to die. I know. I've been there. 🪦\n\nThe trap is *almost always* paraphrase. The audio says "researchers discovered" → the answer sheet says "scientists found". Same meaning, different words. Examiners punish surface-word matching.\n\n**Drill for the next 3 days:** take any IELTS Section 4 transcript. Highlight every keyword in the question. Find the paraphrase in the audio. Count them. You'll see the pattern in 20 minutes.\n\nWhich Cambridge book are you using? I'll point you to a brutal Section 4 that'll humble even Band 8 candidates. 😏`,
  `Beautiful question. The Reading paper is a *time game disguised as an English test*. Most Band 6 candidates know enough English for Band 8 — they just run out of clock.\n\n**The 1-minute rule:** spend exactly 1 minute per question on a 60-min, 40-question paper. If stuck, mark it, move on, return at the end.\n\n**True/False/Not Given** trips up 9 out of 10 learners:\n• **True** — the text actively says it\n• **False** — the text actively contradicts it\n• **Not Given** — the text is silent\n\nWhat's your current reading band? I'll build you a 14-day plan.`,
];

const MOCK_THANKS = [
  `Anytime. That's literally my whole job — that and silently judging comma splices. 😌`,
  `My pleasure. Now go practise before I have to chase you. 💨`,
];

let ieltsIdx = 0;

function pickMock(messages: TutorChatMsg[]): string {
  const last = (messages[messages.length - 1]?.content ?? '').toLowerCase();

  // Detect intent by keywords (works for English + Uzbek + Russian)
  const has = (...words: string[]) => words.some(w => last.includes(w));

  if (has('joke', 'hazil', 'kulgili', 'funny', 'pun')) {
    return MOCK_JOKES[Math.floor(Math.random() * MOCK_JOKES.length)];
  }
  if (has('how are you', 'qandaysiz', 'qandaysan', 'kak dela', 'ahvol', "what's up")) {
    return MOCK_HOWAREYOU[Math.floor(Math.random() * MOCK_HOWAREYOU.length)];
  }
  if (has('thanks', 'thank you', 'rahmat', 'spasibo', 'tnx')) {
    return MOCK_THANKS[Math.floor(Math.random() * MOCK_THANKS.length)];
  }
  if (has('who are you', 'about you', 'your name', 'kim siz', 'your story')) {
    return MOCK_ABOUT_ME[0];
  }
  if (has('motivat', 'tired', 'gave up', 'charchadim', 'tashladim', 'give up', 'cant', "can't", 'depress')) {
    return MOCK_MOTIVATION[0];
  }
  // Greeting detection (be liberal — short message + greeting word)
  if (last.length < 60 && has('salom', 'hello', 'hi ', 'hey', 'assalom', 'привет', 'good morning', 'good evening', 'good afternoon')) {
    return MOCK_GREETINGS[Math.floor(Math.random() * MOCK_GREETINGS.length)];
  }

  // Default → IELTS-flavoured response
  return MOCK_IELTS[(ieltsIdx++) % MOCK_IELTS.length];
}

export const tutor = {
  /** Send the running conversation to Professor Linguo. */
  async chat(messages: TutorChatMsg[], section?: 'listening'|'reading'|'writing'|'speaking') {
    if (useMock) {
      await wait(700 + Math.random() * 700);
      return { reply: pickMock(messages), model: 'mock-prof-linguo' };
    }
    return fn<{ reply: string; model: string }>('ielts-tutor', { messages, section });
  },
};

// ----------------------- GAMIFICATION -----------------------

export const gamify = {
  async getBadges(): Promise<Badge[]> {
    if (useMock) { await wait(); return BADGES; }
    const { data: { user } } = await supabase!.auth.getUser();
    const { data: prog } = await supabase!.from('progress').select('badges').eq('user_id', user?.id).maybeSingle();
    const earned = new Set(prog?.badges ?? []);
    return BADGES.map(b => ({ ...b, unlocked: earned.has(b.id) }));
  },

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    if (useMock) { await wait(); return LEADERBOARD; }
    const { data } = await supabase!.from('progress').select('user_id, level, streak, profiles(name)').order('level', { ascending: false }).limit(10);
    return (data ?? []).map((r, i) => {
      const prof = Array.isArray(r.profiles) ? r.profiles[0] : (r.profiles as { name?: string } | null);
      return {
        userId: r.user_id, name: prof?.name ?? 'User',
        countryFlag: '🇺🇿', streak: r.streak, level: r.level, isMe: i === 1,
      };
    });
  },
};

// ----------------------- PARENT MODULE -----------------------

export const parentApi = {
  async getChildren(_parentId: string): Promise<ParentChild[]> {
    if (useMock) { await wait(); return PARENT_CHILDREN; }
    const { data } = await supabase!
      .from('parent_children')
      .select('*, child:profiles!parent_children_child_id_fkey(name, age, avatar_url)')
      .eq('is_active', true);
    return (data ?? []).map(r => ({
      id: r.id, parentId: r.parent_id, childId: r.child_id,
      name: r.child?.name ?? '', age: r.child?.age ?? 0,
      linkedAt: r.linked_at ?? r.created_at, isActive: r.is_active,
      avatarUrl: r.child?.avatar_url,
    }));
  },

  async createLinkCode(_parentId: string, childName: string, childPhone?: string) {
    if (useMock) {
      await wait();
      return { code: String(Math.floor(100000 + Math.random() * 900000)) };
    }
    return fn<{ code: string }>('parent-link-code', { childName, childPhone });
  },

  async redeemLinkCode(code: string) {
    if (useMock) { await wait(); return { ok: true }; }
    return fn<{ ok: true }>('parent-link-redeem', { code });
  },

  async getControls(childId: string): Promise<ParentalControls> {
    if (useMock) {
      await wait();
      return PARENTAL_CONTROLS[childId] ?? { childId, dailyLimitMins: 60, allowedFrom: '15:00', allowedTo: '21:00', aiChatEnabled: false, leaderboardVisible: true };
    }
    const { data } = await supabase!.from('parental_controls').select('*').eq('child_id', childId).maybeSingle();
    if (!data) return { childId, dailyLimitMins: 60, allowedFrom: '15:00', allowedTo: '21:00', aiChatEnabled: false, leaderboardVisible: true };
    return {
      childId: data.child_id,
      dailyLimitMins: data.daily_limit_mins,
      allowedFrom: data.allowed_from, allowedTo: data.allowed_to,
      aiChatEnabled: data.ai_chat_enabled,
      leaderboardVisible: data.leaderboard_visible,
    };
  },

  async updateControls(c: ParentalControls): Promise<ParentalControls> {
    if (useMock) { await wait(); PARENTAL_CONTROLS[c.childId] = c; return c; }
    await supabase!.from('parental_controls').upsert({
      child_id: c.childId,
      daily_limit_mins: c.dailyLimitMins,
      allowed_from: c.allowedFrom, allowed_to: c.allowedTo,
      ai_chat_enabled: c.aiChatEnabled,
      leaderboard_visible: c.leaderboardVisible,
    });
    return c;
  },

  async getReports(childId: string): Promise<DailyReport[]> {
    if (useMock) { await wait(); return DAILY_REPORTS.filter(r => r.childId === childId); }
    const { data } = await supabase!.from('daily_reports').select('*').eq('child_id', childId).order('date');
    return (data ?? []).map(r => ({
      id: r.id, childId: r.child_id, date: r.date,
      minutesSpent: r.minutes_spent, lessonsDone: r.lessons_done,
      xpEarned: r.xp_earned, streakMaintained: r.streak_maintained,
    }));
  },
};

// ----------------------- PAYMENTS (initiate from frontend) -----------------------

export const billing = {
  /** Build a Payme checkout URL. The user is redirected; Payme calls our merchant function. */
  paymeCheckoutUrl(opts: { userId: string; plan: 'kids'|'teen'|'ielts'|'family'|'corporate'; amountUzs: number }) {
    const merchant = import.meta.env.VITE_PAYME_MERCHANT_ID ?? '';
    const params = new URLSearchParams({
      m: merchant,
      'ac.user_id': opts.userId,
      'ac.plan':    opts.plan,
      a:            String(opts.amountUzs * 100),    // tiyin
      l:            'en',
      c:            window.location.origin + '/parent/billing?status=ok',
    });
    const b64 = btoa(params.toString());
    return `https://checkout.paycom.uz/${b64}`;
  },

  /** Click checkout URL. */
  clickCheckoutUrl(opts: { userId: string; orderId: string; amountUzs: number }) {
    const merchantId = import.meta.env.VITE_CLICK_MERCHANT_ID ?? '';
    const serviceId  = import.meta.env.VITE_CLICK_SERVICE_ID  ?? '';
    const ret        = encodeURIComponent(window.location.origin + '/parent/billing?status=ok');
    return `https://my.click.uz/services/pay?service_id=${serviceId}&merchant_id=${merchantId}&amount=${opts.amountUzs}&transaction_param=${opts.orderId}&return_url=${ret}`;
  },
};
