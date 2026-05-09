// =============================================================================
// Article reader — paper-style page with annotated text, glossary panel,
// comprehension quiz at the end. Saves "article_read" activity on mount.
// =============================================================================
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Cosmos } from '@/components/layout/Cosmos';
import { AppShell } from '@/components/layout/AppShell';
import { Topbar } from '@/components/layout/Topbar';
import { AnnotatedText } from '@/components/ui/AnnotatedText';
import { useActivity } from '@/store/activity';
import { useWordNotes } from '@/store/wordNotes';
import { useUserArticles } from '@/store/userArticles';
import { getArticleById } from '@/data/articles/daily-articles';
import type { CEFR } from '@/data/vocabulary/cambridge-bank';

const CEFR_COLORS: Record<CEFR, string> = {
  A1: 'bg-emerald-200 text-emerald-900 border-emerald-400',
  A2: 'bg-emerald-200 text-emerald-900 border-emerald-400',
  B1: 'bg-blue-200 text-blue-900 border-blue-400',
  B2: 'bg-blue-300 text-blue-950 border-blue-500',
  C1: 'bg-violet-200 text-violet-900 border-violet-400',
  C2: 'bg-fuchsia-200 text-fuchsia-900 border-fuchsia-400',
};

export function ArticleDetail() {
  const { id = '' } = useParams();
  const userList = useUserArticles(s => s.list);
  const article = getArticleById(id, userList);
  const navigate = useNavigate();
  const log = useActivity(s => s.log);
  const upsert = useWordNotes(s => s.upsert);
  const noteOf = useWordNotes(s => s.notes);
  const isUserArticle = !!userList.find(a => a.id === id);

  const [answers,   setAnswers]   = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => { if (article) log('article_read', { id: article.id, title: article.title, cefr: article.cefr }); }, [id]); // eslint-disable-line

  if (!article) {
    return (
      <>
        <Cosmos />
        <AppShell>
          <Topbar variant="search" />
          <div className="grid place-items-center flex-1 text-slate-300 text-center">
            <div>
              <p className="text-3xl mb-2">📭</p>
              Article not found.
              <button onClick={() => navigate('/library')}
                      className="block mt-4 btn-mint mx-auto">← Back to library</button>
            </div>
          </div>
        </AppShell>
      </>
    );
  }

  const correct = useMemo(
    () => article.questions.filter((q, i) => answers[i] === q.correct).length,
    [answers, article]
  );

  function saveGlossaryWord(word: string, translation: string) {
    upsert(word, { translation });
  }

  return (
    <>
      <Cosmos />
      <AppShell>
        <Topbar variant="banner" bannerTitle="Daily Read" bannerSubtitle="Tap any word to save its meaning." />

        <section className="grid grid-cols-[1fr_320px] gap-5 flex-1 min-h-0 overflow-hidden">
          {/* Article (paper) */}
          <article className="paper-panel overflow-auto">
            <div className="flex items-center justify-between mb-4 sticky top-0 -mx-6 -mt-6 px-6 py-3 z-10
                            bg-gradient-to-b from-[#f5efe1] to-[#f5efe1]/85 backdrop-blur-sm border-b border-slate-300/50">
              <Link to="/library"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold
                               text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 hover:-translate-x-0.5 transition shadow-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
                </svg>
                Back to Library
              </Link>
              {isUserArticle && (
                <Link to={`/library/edit/${article.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold
                                 text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm">
                  ✎ Edit
                </Link>
              )}
            </div>

            {article.cover && (
              <div className="mt-3 mb-5 -mx-2 rounded-2xl overflow-hidden border border-slate-300">
                <img src={article.cover} alt="" className="w-full h-56 object-cover" />
              </div>
            )}

            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${CEFR_COLORS[article.cefr]}`}>{article.cefr}</span>
              <span className="px-2 py-0.5 rounded-full bg-white/70 border border-slate-300 text-[10px] text-slate-700">{article.readingMin} min read</span>
              {article.topics.map(t => (
                <span key={t} className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide bg-white/70 border border-slate-300 text-slate-700">{t}</span>
              ))}
              <span className="ml-auto text-[10px] text-slate-500">{new Date(article.publishedAt).toLocaleDateString()}</span>
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">{article.title}</h1>
            {article.subtitle && <p className="text-base text-slate-700 italic mt-1.5 mb-5">{article.subtitle}</p>}

            <div className="prose-paper text-[15px] leading-8 text-slate-800 space-y-4 mt-4">
              {article.body.split('\n\n').map((para, i) => (
                <p key={i}><AnnotatedText>{para}</AnnotatedText></p>
              ))}
            </div>

            {/* Quiz */}
            <ComprehensionQuiz
              article={article}
              answers={answers}
              setAnswers={setAnswers}
              submitted={submitted}
              onSubmit={() => {
                setSubmitted(true);
                log('quiz_submitted', { lesson: article.id, score: Math.round((correct / article.questions.length) * 100), correct, total: article.questions.length });
              }}
              correct={correct}
            />

            {article.source && <p className="mt-6 text-xs text-slate-500 italic">Source: {article.source}</p>}
          </article>

          {/* Glossary sidebar */}
          <aside className="glass-panel p-5 flex flex-col gap-3 overflow-auto">
            <header>
              <p className="text-[10px] tracking-[0.25em] text-slate-400 mb-1">GLOSSARY</p>
              <p className="text-sm text-slate-300">Hard words from this article — tap "Save" to add to your vocabulary.</p>
            </header>

            <div className="flex flex-col gap-2">
              {article.glossary.map(g => {
                const saved = !!noteOf[g.word.toLowerCase()];
                return (
                  <div key={g.word}
                       className={`rounded-xl p-3 border transition
                                   ${saved
                                     ? 'border-amber-400/40 bg-amber-400/[0.06]'
                                     : 'border-white/8 bg-white/[0.03]'}`}>
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <h4 className="text-sm font-bold text-white">{g.word}</h4>
                      <button onClick={() => saveGlossaryWord(g.word, g.defUz)}
                              disabled={saved}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition
                                          ${saved
                                            ? 'bg-amber-300/20 text-amber-200 cursor-default'
                                            : 'bg-cosmic-mint/15 text-cosmic-mint border border-cosmic-mint/40 hover:bg-cosmic-mint/25'}`}>
                        {saved ? '★ saved' : '+ save'}
                      </button>
                    </div>
                    <p className="text-[11.5px] text-slate-300 leading-snug">
                      <span className="text-slate-500 font-mono text-[9px] mr-1">EN</span>{g.defEn}
                    </p>
                    <p className="text-[11.5px] text-slate-300/85 leading-snug mt-0.5">
                      <span className="text-slate-500 font-mono text-[9px] mr-1">UZ</span>{g.defUz}
                    </p>
                  </div>
                );
              })}
            </div>

            <p className="mt-2 text-[11px] text-slate-400 italic">
              💡 You can also tap any word in the article itself to save your own translation.
            </p>
          </aside>
        </section>
      </AppShell>
    </>
  );
}

// ───────────────────────── Comprehension quiz ─────────────────────────

function ComprehensionQuiz({
  article, answers, setAnswers, submitted, onSubmit, correct,
}: {
  article: ReturnType<typeof getArticleById>;
  answers: Record<number, number>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<number, number>>>;
  submitted: boolean;
  onSubmit(): void;
  correct: number;
}) {
  if (!article) return null;
  return (
    <section className="mt-10 pt-6 border-t border-slate-300">
      <h2 className="text-lg font-bold text-slate-900 mb-1">Quick check</h2>
      <p className="text-xs text-slate-600 mb-5">Three short questions to lock in what you read. Not graded.</p>

      <div className="flex flex-col gap-4">
        {article.questions.map((q, qi) => (
          <div key={qi} className="rounded-xl p-4 border border-slate-300 bg-white/60">
            <p className="text-[13.5px] text-slate-800 mb-2"><b className="mr-1.5">{qi + 1}.</b>{q.prompt}</p>
            <div className="flex flex-col gap-1.5">
              {q.options.map((opt, i) => {
                const sel = answers[qi] === i;
                const right = submitted && i === q.correct;
                const wrong = submitted && sel && i !== q.correct;
                return (
                  <button key={i}
                          onClick={() => !submitted && setAnswers(a => ({ ...a, [qi]: i }))}
                          disabled={submitted}
                          className={`text-left rounded-lg px-3 py-1.5 text-[12.5px] transition
                                      ${right ? 'bg-emerald-500 text-white border border-emerald-600'
                                        : wrong ? 'bg-rose-500 text-white border border-rose-600'
                                        : sel   ? 'bg-blue-600 text-white border border-blue-700'
                                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'}`}>
                    {opt}
                  </button>
                );
              })}
            </div>
            {submitted && q.explanation && (
              <p className="mt-2 text-[11px] text-slate-600 italic">💡 {q.explanation}</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button onClick={onSubmit} disabled={submitted}
                className="rounded-full px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
          {submitted ? `Score: ${correct}/${article.questions.length}` : 'Check answers'}
        </button>
        {submitted && correct === article.questions.length && (
          <span className="text-emerald-700 font-bold text-sm">Perfect — full marks! 🎉</span>
        )}
      </div>
    </section>
  );
}
