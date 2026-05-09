// =============================================================================
// Article editor — manually create or edit a Daily Read article.
// Saves to localStorage via useUserArticles. Categories/topics free-form
// (English + Uzbek both supported).
// =============================================================================
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Cosmos } from '@/components/layout/Cosmos';
import { AppShell } from '@/components/layout/AppShell';
import { Topbar } from '@/components/layout/Topbar';
import { useUserArticles } from '@/store/userArticles';
import { TOPIC_SUGGESTIONS, type Article, type GlossaryEntry, type QuickQuestion } from '@/data/articles/daily-articles';
import { ALL_CEFR, type CEFR } from '@/data/vocabulary/cambridge-bank';

const SUGGESTED_UZ_TOPICS = ["ta'lim", 'texnologiya', 'fan', 'tibbiyot', 'biznes', 'tabiat', 'sport', 'madaniyat', 'tarix', 'falsafa'];

export function ArticleEditor() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const list   = useUserArticles(s => s.list);
  const add    = useUserArticles(s => s.add);
  const update = useUserArticles(s => s.update);
  const remove = useUserArticles(s => s.remove);

  const editing = id ? list.find(a => a.id === id) : undefined;

  const [title,    setTitle]    = useState(editing?.title ?? '');
  const [subtitle, setSubtitle] = useState(editing?.subtitle ?? '');
  const [cefr,     setCefr]     = useState<CEFR>(editing?.cefr ?? 'B2');
  const [readingMin, setReadingMin] = useState(editing?.readingMin ?? 4);
  const [topics,   setTopics]   = useState<string[]>(editing?.topics ?? []);
  const [topicInput, setTopicInput] = useState('');
  const [cover,    setCover]    = useState(editing?.cover ?? '');
  const [body,     setBody]     = useState(editing?.body ?? '');
  const [source,   setSource]   = useState(editing?.source ?? '');
  const [glossary, setGlossary] = useState<GlossaryEntry[]>(editing?.glossary ?? []);
  const [questions, setQuestions] = useState<QuickQuestion[]>(editing?.questions ?? []);
  const [error, setError] = useState<string | null>(null);

  // Auto-estimate reading time from body length (≈200 wpm) — only on first load
  useEffect(() => {
    if (editing) return;
    const words = body.trim().split(/\s+/).filter(Boolean).length;
    if (words > 0) setReadingMin(Math.max(1, Math.round(words / 200)));
  }, [body]); // eslint-disable-line

  function addTopic(t: string) {
    const cleaned = t.trim().toLowerCase();
    if (!cleaned || topics.includes(cleaned)) return;
    setTopics([...topics, cleaned]);
    setTopicInput('');
  }
  function removeTopic(t: string) { setTopics(topics.filter(x => x !== t)); }

  function addGlossary() { setGlossary([...glossary, { word: '', defEn: '', defUz: '' }]); }
  function setGlossaryAt(i: number, patch: Partial<GlossaryEntry>) {
    setGlossary(glossary.map((g, idx) => idx === i ? { ...g, ...patch } : g));
  }
  function removeGlossary(i: number) { setGlossary(glossary.filter((_, idx) => idx !== i)); }

  function addQuestion() {
    setQuestions([...questions, { prompt: '', options: ['', '', '', ''], correct: 0 }]);
  }
  function setQuestionAt(i: number, patch: Partial<QuickQuestion>) {
    setQuestions(questions.map((q, idx) => idx === i ? { ...q, ...patch } : q));
  }
  function setOption(i: number, optIdx: number, value: string) {
    setQuestions(questions.map((q, idx) => {
      if (idx !== i) return q;
      const opts = [...q.options];
      opts[optIdx] = value;
      return { ...q, options: opts };
    }));
  }
  function removeQuestion(i: number) { setQuestions(questions.filter((_, idx) => idx !== i)); }

  function save() {
    setError(null);
    if (!title.trim())     return setError('Title is required.');
    if (body.trim().length < 100) return setError('Article body should be at least 100 characters.');
    if (topics.length === 0) return setError('Add at least one topic / category.');

    const cleanGlossary = glossary.filter(g => g.word.trim());
    const cleanQuestions = questions.filter(q => q.prompt.trim() && q.options.every(o => o.trim()));

    const payload: Omit<Article, 'id' | 'publishedAt'> = {
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      cefr,
      readingMin,
      topics,
      cover: cover.trim() || undefined,
      body: body.trim(),
      glossary: cleanGlossary,
      questions: cleanQuestions,
      source: source.trim() || undefined,
    };

    if (editing) {
      update(editing.id, payload);
      navigate(`/library/${editing.id}`);
    } else {
      const created = add(payload);
      navigate(`/library/${created.id}`);
    }
  }

  function deleteArticle() {
    if (!editing) return;
    if (!confirm(`Delete "${editing.title}"? This cannot be undone.`)) return;
    remove(editing.id);
    navigate('/library');
  }

  const wordCount = useMemo(() => body.trim().split(/\s+/).filter(Boolean).length, [body]);

  return (
    <>
      <Cosmos />
      <AppShell>
        <Topbar variant="banner" bannerTitle={editing ? 'Edit article' : 'New article'}
                bannerSubtitle="Upload your own daily reading material — saved locally on this device." />

        <section className="grid grid-cols-[1fr_360px] gap-5 flex-1 min-h-0 overflow-hidden">
          <article className="paper-panel overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => navigate('/library')} className="text-xs text-slate-500 hover:text-slate-800">
                ← Back to library
              </button>
              {editing && (
                <button onClick={deleteArticle} className="text-xs text-rose-600 hover:underline">Delete article</button>
              )}
            </div>

            <Field label="Title" required>
              <input value={title} onChange={e => setTitle(e.target.value)}
                     placeholder="e.g. The science of sleep"
                     className="paper-input text-lg font-bold" />
            </Field>

            <Field label="Subtitle (optional)">
              <input value={subtitle} onChange={e => setSubtitle(e.target.value)}
                     placeholder="One short summary line shown under the title"
                     className="paper-input" />
            </Field>

            <div className="grid grid-cols-3 gap-3 mt-3">
              <Field label="CEFR level">
                <select value={cefr} onChange={e => setCefr(e.target.value as CEFR)} className="paper-input">
                  {ALL_CEFR.map(l => <option key={l}>{l}</option>)}
                </select>
              </Field>
              <Field label="Reading time (min)">
                <input type="number" min={1} max={60} value={readingMin}
                       onChange={e => setReadingMin(Number(e.target.value) || 1)}
                       className="paper-input" />
              </Field>
              <Field label="Cover image URL (optional)">
                <input value={cover} onChange={e => setCover(e.target.value)}
                       placeholder="https://…"
                       className="paper-input" />
              </Field>
            </div>

            {/* Topics / categories */}
            <Field label="Topics / Categories" required>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {topics.map(t => (
                  <span key={t} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-300 text-[12px]">
                    {t}
                    <button onClick={() => removeTopic(t)} className="hover:text-rose-600 leading-none">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input value={topicInput}
                       onChange={e => setTopicInput(e.target.value)}
                       onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTopic(topicInput); } }}
                       placeholder="Type and press Enter — e.g. ta'lim"
                       className="paper-input flex-1" />
                <button onClick={() => addTopic(topicInput)}
                        className="px-4 py-2 rounded-md text-sm font-bold bg-blue-600 text-white hover:bg-blue-700">+</button>
              </div>
              <div className="mt-2">
                <p className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">Suggestions:</p>
                <div className="flex flex-wrap gap-1.5">
                  {[...SUGGESTED_UZ_TOPICS, ...TOPIC_SUGGESTIONS].map(t => (
                    <button key={t} onClick={() => addTopic(t)}
                            disabled={topics.includes(t)}
                            className="px-2 py-0.5 rounded-full text-[10px] bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40">
                      + {t}
                    </button>
                  ))}
                </div>
              </div>
            </Field>

            <Field label={`Body (paragraphs separated by blank lines) · ${wordCount} word${wordCount === 1 ? '' : 's'}`} required>
              <textarea value={body} onChange={e => setBody(e.target.value)}
                        rows={12}
                        placeholder={`Paragraph one…\n\nParagraph two…\n\nUse two newlines between paragraphs.`}
                        className="paper-input font-serif leading-7 resize-y min-h-[260px]" />
            </Field>

            <Field label="Source / attribution (optional)">
              <input value={source} onChange={e => setSource(e.target.value)}
                     placeholder="e.g. The Economist · BBC News · Original"
                     className="paper-input" />
            </Field>

            {error && <p className="mt-3 text-sm text-rose-700 font-bold">⚠ {error}</p>}

            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => navigate('/library')}
                      className="px-5 py-2.5 rounded-full text-sm text-slate-600 hover:bg-slate-100">Cancel</button>
              <button onClick={save}
                      className="px-7 py-2.5 rounded-full text-sm font-bold bg-blue-600 text-white hover:bg-blue-700">
                {editing ? 'Save changes' : 'Publish article'}
              </button>
            </div>
          </article>

          {/* Glossary + questions sidebar */}
          <aside className="glass-panel p-5 flex flex-col gap-5 overflow-auto">
            {/* Glossary editor */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] tracking-[0.2em] text-slate-400">GLOSSARY</p>
                <button onClick={addGlossary}
                        className="text-[11px] px-2 py-1 rounded-full bg-cosmic-mint/15 text-cosmic-mint border border-cosmic-mint/40 hover:bg-cosmic-mint/25">
                  + Add word
                </button>
              </div>
              {glossary.length === 0 && <p className="text-[11px] text-slate-500 italic">No glossary words yet. Add hard words for the learner.</p>}
              <div className="flex flex-col gap-2">
                {glossary.map((g, i) => (
                  <div key={i} className="rounded-lg p-2.5 bg-white/[0.03] border border-white/8 flex flex-col gap-1.5">
                    <div className="flex gap-1.5">
                      <input value={g.word} onChange={e => setGlossaryAt(i, { word: e.target.value })}
                             placeholder="word" className="input-glass flex-1 text-xs" />
                      <button onClick={() => removeGlossary(i)} className="px-2 text-rose-300 hover:text-rose-500" title="Remove">×</button>
                    </div>
                    <input value={g.defEn} onChange={e => setGlossaryAt(i, { defEn: e.target.value })}
                           placeholder="EN definition" className="input-glass text-xs" />
                    <input value={g.defUz} onChange={e => setGlossaryAt(i, { defUz: e.target.value })}
                           placeholder="UZ tarjima" className="input-glass text-xs" />
                  </div>
                ))}
              </div>
            </div>

            {/* Quiz editor */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] tracking-[0.2em] text-slate-400">QUICK QUESTIONS</p>
                <button onClick={addQuestion}
                        className="text-[11px] px-2 py-1 rounded-full bg-cosmic-sky/15 text-cosmic-sky border border-cosmic-sky/40 hover:bg-cosmic-sky/25">
                  + Add question
                </button>
              </div>
              {questions.length === 0 && <p className="text-[11px] text-slate-500 italic">Optional — 2-4 quick comprehension questions.</p>}
              <div className="flex flex-col gap-2">
                {questions.map((q, i) => (
                  <div key={i} className="rounded-lg p-2.5 bg-white/[0.03] border border-white/8 flex flex-col gap-1.5">
                    <div className="flex gap-1.5">
                      <input value={q.prompt} onChange={e => setQuestionAt(i, { prompt: e.target.value })}
                             placeholder={`Q${i + 1} prompt`} className="input-glass flex-1 text-xs" />
                      <button onClick={() => removeQuestion(i)} className="px-2 text-rose-300 hover:text-rose-500" title="Remove">×</button>
                    </div>
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-1.5">
                        <button onClick={() => setQuestionAt(i, { correct: optIdx })}
                                title="Mark as correct"
                                className={`w-6 h-6 rounded-full text-[10px] font-bold transition
                                            ${q.correct === optIdx
                                              ? 'bg-emerald-500 text-white'
                                              : 'bg-white/[0.05] text-slate-400 hover:bg-white/[0.10]'}`}>
                          {String.fromCharCode(65 + optIdx)}
                        </button>
                        <input value={opt} onChange={e => setOption(i, optIdx, e.target.value)}
                               placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                               className="input-glass flex-1 text-xs" />
                      </div>
                    ))}
                    <p className="text-[10px] text-slate-500">Click the green letter to mark the correct answer.</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </AppShell>
    </>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block mt-3">
      <span className="text-[10px] uppercase tracking-wide text-slate-600 font-semibold">
        {label} {required && <span className="text-rose-600">*</span>}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
