// =============================================================================
// AnnotatedText — turns any text into a stream of clickable words.
// Click any word → popover lets the learner add a translation + note.
// Words with notes get a subtle underline so they're easy to spot next time.
// =============================================================================
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWordNotes } from '@/store/wordNotes';

interface Props { children: string; }

export function AnnotatedText({ children }: Props) {
  const tokens = useTokens(children);
  const [active, setActive] = useState<{ word: string; anchor: DOMRect } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popover on Escape or outside click
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setActive(null); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {tokens.map((t, i) =>
        t.kind === 'word' ? (
          <WordSpan
            key={i}
            text={t.text}
            onSelect={(rect) => setActive({ word: t.text, anchor: rect })}
            isActive={!!active && active.word.toLowerCase() === t.text.toLowerCase()}
          />
        ) : t.kind === 'newline' ? (
          <br key={i} />
        ) : (
          <span key={i}>{t.text}</span>
        )
      )}

      <AnimatePresence>
        {active && (
          <NotePopover
            word={active.word}
            anchor={active.anchor}
            container={containerRef.current}
            onClose={() => setActive(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ───────────────────────── Word span ─────────────────────────

function WordSpan({
  text, onSelect, isActive,
}: { text: string; onSelect: (rect: DOMRect) => void; isActive: boolean }) {
  const note = useWordNotes(s => s.notes[text.toLowerCase()]);
  const has = !!note;

  function click(e: React.MouseEvent<HTMLSpanElement>) {
    onSelect(e.currentTarget.getBoundingClientRect());
  }

  return (
    <span
      onClick={click}
      title={has ? `${note.translation}${note.note ? ' — ' + note.note : ''}` : 'Click to add a note'}
      className={`cursor-pointer transition rounded-sm
                  ${has
                    ? 'bg-yellow-200/70 underline decoration-amber-500 decoration-2 underline-offset-2 hover:bg-yellow-300'
                    : 'hover:bg-blue-100/70 hover:underline'}
                  ${isActive ? 'ring-2 ring-blue-400 bg-blue-100' : ''}`}
    >
      {text}
    </span>
  );
}

// ───────────────────────── Note popover ─────────────────────────

function NotePopover({
  word, anchor, container, onClose,
}: { word: string; anchor: DOMRect; container: HTMLElement | null; onClose(): void }) {
  const upsert = useWordNotes(s => s.upsert);
  const remove = useWordNotes(s => s.remove);
  const existing = useWordNotes(s => s.notes[word.toLowerCase()]);

  const [translation, setTranslation] = useState(existing?.translation ?? '');
  const [note,        setNote]        = useState(existing?.note ?? '');

  const popRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  // Position relative to container
  useLayoutEffect(() => {
    const c = container?.getBoundingClientRect();
    if (!c) return;
    const popW = 320;
    const popH = popRef.current?.offsetHeight ?? 200;
    let left = anchor.left - c.left - popW / 2 + anchor.width / 2;
    let top  = anchor.bottom - c.top + 8;
    // Clamp horizontally
    if (left < 8) left = 8;
    if (left + popW > c.width - 8) left = c.width - popW - 8;
    // Flip above if not enough room below
    if (top + popH > c.height) top = anchor.top - c.top - popH - 8;
    setPos({ top, left });
  }, [anchor, container]);

  // Click outside to close
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (popRef.current && !popRef.current.contains(e.target as Node)) onClose();
    }
    // Skip the click that opened the popover
    const id = setTimeout(() => document.addEventListener('mousedown', onDown), 0);
    return () => { clearTimeout(id); document.removeEventListener('mousedown', onDown); };
  }, [onClose]);

  function save() {
    upsert(word, { translation: translation.trim(), note: note.trim() });
    onClose();
  }
  function deleteNote() { remove(word); onClose(); }

  return (
    <motion.div
      ref={popRef}
      initial={{ opacity: 0, y: -6, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit   ={{ opacity: 0, y: -6, scale: 0.95 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="absolute z-50 w-[320px] rounded-2xl shadow-2xl border border-slate-300 overflow-hidden"
      style={{ top: pos.top, left: pos.left, background: '#ffffff' }}
    >
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200 flex items-baseline gap-2">
        <h3 className="text-lg font-bold text-slate-900 lowercase">{word}</h3>
        {existing && (
          <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-200 text-amber-800 font-semibold">
            saved
          </span>
        )}
        <button onClick={onClose} className="ml-auto text-slate-500 hover:text-slate-900 text-lg leading-none">×</button>
      </div>

      <div className="p-3 flex flex-col gap-3">
        <label className="block">
          <span className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">
            🇺🇿 Translation
          </span>
          <input
            autoFocus
            value={translation}
            onChange={e => setTranslation(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) save(); }}
            placeholder="Sizning tarjimangiz…"
            className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </label>

        <label className="block">
          <span className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">
            📝 Note / mnemonic
          </span>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) save(); }}
            rows={3}
            placeholder="Esda saqlash uchun belgi, misol gap, yoki kontekst…"
            className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
          />
        </label>

        <div className="flex justify-between items-center pt-1">
          {existing ? (
            <button onClick={deleteNote}
                    className="text-xs text-rose-600 hover:underline">
              Delete
            </button>
          ) : <span />}
          <div className="flex gap-2">
            <button onClick={onClose}
                    className="px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-100">
              Cancel
            </button>
            <button onClick={save}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700">
              Save
            </button>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 text-center">⌘/Ctrl + Enter to save quickly</p>
      </div>
    </motion.div>
  );
}

// ───────────────────────── Tokenizer ─────────────────────────

type Token = { kind: 'word' | 'space' | 'punct' | 'newline'; text: string };

function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  // Split into lines first to preserve paragraph breaks
  const lines = text.split('\n');
  lines.forEach((line, lineIdx) => {
    // Match: word (with optional apostrophe contraction) | whitespace | other
    const re = /[A-Za-z][A-Za-zÀ-ɏ]*(?:['’][A-Za-z]+)?|\s+|[^A-Za-z\s]+/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(line))) {
      const t = m[0];
      if (/^\s+$/.test(t))           tokens.push({ kind: 'space', text: t });
      else if (/^[A-Za-z]/.test(t))  tokens.push({ kind: 'word',  text: t });
      else                            tokens.push({ kind: 'punct', text: t });
    }
    if (lineIdx < lines.length - 1) tokens.push({ kind: 'newline', text: '\n' });
  });
  return tokens;
}

function useTokens(text: string) {
  const ref = useRef<{ key: string; tokens: Token[] }>({ key: '', tokens: [] });
  if (ref.current.key !== text) ref.current = { key: text, tokens: tokenize(text) };
  return ref.current.tokens;
}
