// =============================================================================
// One dictionary to search across every word bank we ship.
//
// Three banks of very different depth. Cambridge (`cambridge-bank.ts`) has full
// entries — senses, idioms, word family. The curated bank (`bilingual.ts`) has
// IPA, definitions in both languages and examples. The AWL bank (`awl.ts`) is
// large but carries only what can be stated accurately at that scale.
//
// Before this they were searched separately, so which words you could find
// depended on which screen you were on. Merging them here means callers get one
// list and one ranking rule instead of each screen inventing its own.
// =============================================================================

import { CAMBRIDGE_BANK } from './cambridge-bank';
import { VOCAB_BANK } from './bilingual';
import { AWL_WORDS } from './awl';

export interface LookupEntry {
  id:         string;
  en:         string;
  uz:         string;
  uzAlt?:     string[];
  pos?:       string;
  phonetic?:  string;
  defUz?:     string;
  defEn?:     string;
  exampleEn?: string;
  exampleUz?: string;
  level?:     string;
  category?:  string;
  /** 1–10 for AWL entries; absent for the other banks. */
  sublist?:   number;
  cefr?:      string;
  /** Set when a full Cambridge entry exists — senses, idioms, word family.
   *  The value is that entry's own id, so a caller can open the detail view. */
  dictId?:    string;
}

/**
 * Three banks, one list, richest wins on collision.
 *
 * Cambridge entries carry senses, idioms and a word family, so they outrank the
 * curated bank; the curated bank has IPA and example sentences, so it outranks
 * an AWL row for the same headword. Without this the same word could appear
 * three times, each time shallower than the last.
 */
function buildDictionary(): LookupEntry[] {
  const byWord = new Map<string, LookupEntry>();

  for (const w of CAMBRIDGE_BANK) {
    byWord.set(w.headword.toLowerCase(), {
      id: `k:${w.id}`,
      dictId: w.id,
      en: w.headword,
      uz: w.uz,
      pos: w.senses[0]?.pos,
      phonetic: w.pron?.uk,
      defUz: w.senses[0]?.defUz,
      defEn: w.senses[0]?.defEn,
      exampleEn: w.senses[0]?.examples?.[0]?.en,
      exampleUz: w.senses[0]?.examples?.[0]?.uz,
      cefr: w.cefr,
    });
  }

  for (const w of VOCAB_BANK) {
    if (byWord.has(w.en.toLowerCase())) continue;
    byWord.set(w.en.toLowerCase(), {
      id: `c:${w.id}`,
      en: w.en,
      uz: w.uz,
      uzAlt: w.uzAlt,
      pos: w.partOfSpeech,
      phonetic: w.phonetic,
      defUz: w.defUz,
      defEn: w.defEn,
      exampleEn: w.exampleEn,
      exampleUz: w.exampleUz,
      level: w.level,
      category: w.category,
    });
  }

  for (const w of AWL_WORDS) {
    const key = w.en.toLowerCase();
    if (byWord.has(key)) continue;
    byWord.set(key, {
      id: `a:${key}`,
      en: w.en,
      uz: w.uz,
      uzAlt: w.uzAlt,
      pos: w.pos,
      defUz: w.defUz,
      category: 'academic',
      sublist: w.sublist,
    });
  }

  return [...byWord.values()];
}

export const DICTIONARY: LookupEntry[] = buildDictionary();

/**
 * Rank so the headword the user typed comes first. Matching anywhere in the
 * entry is right for recall — you should be able to find a word from its
 * definition — but without ranking, a word that merely mentions the query in its
 * definition sits next to an exact hit.
 */
function score(e: LookupEntry, q: string): number {
  const en = e.en.toLowerCase();
  const uz = e.uz.toLowerCase();
  const alts = (e.uzAlt ?? []).map((a) => a.toLowerCase());
  if (en === q || uz === q || alts.includes(q)) return 0;
  if (en.startsWith(q)) return 1;
  if (uz.startsWith(q) || alts.some((a) => a.startsWith(q))) return 2;
  if (en.includes(q)) return 3;
  if (uz.includes(q) || alts.some((a) => a.includes(q))) return 4;
  return 5; // matched only a definition or a tag
}

function haystack(e: LookupEntry): string {
  return [
    e.en, e.uz, ...(e.uzAlt ?? []),
    e.defUz, e.defEn, e.phonetic, e.category, e.level, e.cefr,
  ].filter(Boolean).join(' ').toLowerCase();
}

export function lookupWord(query: string): LookupEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return DICTIONARY
    .filter((e) => haystack(e).includes(q))
    .sort((a, b) => score(a, q) - score(b, q) || a.en.localeCompare(b.en));
}
