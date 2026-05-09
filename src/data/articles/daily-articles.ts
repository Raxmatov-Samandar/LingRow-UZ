// =============================================================================
// LingRow Daily Read — curated articles for academic vocabulary + reading
// comprehension. Ranges B1 → C2.
// =============================================================================

import type { CEFR } from '@/data/vocabulary/cambridge-bank';

export interface GlossaryEntry {
  word:       string;
  defEn:      string;
  defUz:      string;
}

export interface QuickQuestion {
  prompt:     string;
  options:    string[];
  correct:    number;          // index
  explanation?: string;
}

export interface Article {
  id:          string;
  title:       string;
  subtitle?:   string;
  cefr:        CEFR;
  readingMin:  number;
  topics:      string[];
  publishedAt: string;         // ISO date
  cover?:      string;         // optional image url
  /** Body paragraphs split by blank lines. */
  body:        string;
  glossary:    GlossaryEntry[];
  questions:   QuickQuestion[];
  source?:     string;
}

// -----------------------------------------------------------------------------

export const ARTICLES: Article[] = [
  {
    id: 'a1-ai-classrooms',
    title: 'How AI Is Reshaping the Classroom',
    subtitle: 'From homework helpers to personalised tutors, machine learning is changing how children study.',
    cefr: 'B2',
    readingMin: 4,
    topics: ['technology', 'education'],
    publishedAt: '2026-05-04',
    cover: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&q=80',
    body:
`Five years ago, a typical classroom contained a teacher, a whiteboard and a roomful of students taking notes by hand. Today, in an increasing number of schools, that same classroom also contains an artificial intelligence — usually as a chat assistant accessible through a tablet or laptop.

The most visible change is in homework. Students can now describe a problem and receive an explanation tailored to their level, with worked examples and follow-up questions. Done well, this turns AI into a tireless tutor; done badly, it becomes a shortcut that stops genuine learning. The difference often lies in how the teacher integrates the tool, rather than in the technology itself.

Behind the scenes, AI also helps teachers. Some platforms can mark short essays in seconds, flag weaker areas across the class, and suggest individual practice plans. Educators say the biggest benefit is time: hours that used to be spent on routine marking can be redirected to small-group teaching or creative projects.

The risks are well known. Over-reliance can erode critical thinking, students may copy without understanding, and personal data is being collected at unprecedented scale. Privacy laws are scrambling to catch up.

Still, when used thoughtfully — as a coach, not a crutch — AI may be the most significant educational shift of our generation. The skill to teach now is not just the subject, but how to learn alongside a machine.`,
    glossary: [
      { word: 'tailored',          defEn: 'specially adapted to a particular person or purpose',  defUz: 'shaxs yoki maqsadga moslangan' },
      { word: 'shortcut',          defEn: 'a quicker way to do something',                       defUz: 'qisqa yo‘l, oson usul' },
      { word: 'integrate',         defEn: 'to combine into a whole',                              defUz: 'birlashtirmoq, qo‘shmoq' },
      { word: 'redirected',        defEn: 'changed direction or focus',                           defUz: 'yo‘nalishi o‘zgartirilgan' },
      { word: 'unprecedented',     defEn: 'never having happened before',                         defUz: "misli ko‘rilmagan" },
      { word: 'erode',             defEn: 'to gradually destroy or reduce',                       defUz: 'asta-sekin yo‘q qilmoq' },
      { word: 'crutch',            defEn: 'something one relies on too heavily',                  defUz: "haddan tashqari tayanish vositasi" },
    ],
    questions: [
      { prompt: 'According to the article, what is the most important factor in whether AI helps students?',
        options: ['The brand of the tablet', 'How the teacher integrates it', 'The age of the student', 'The price of the software'],
        correct: 1,
        explanation: 'The article states "the difference often lies in how the teacher integrates the tool, rather than in the technology itself."' },
      { prompt: 'What benefit do teachers report most often?',
        options: ['Faster internet', 'More holidays', 'Saved time on routine marking', 'Lower salaries'],
        correct: 2 },
      { prompt: "What is the writer's overall view of AI in education?",
        options: ['Strongly negative', 'Cautiously optimistic', 'Indifferent', 'Already obsolete'],
        correct: 1 },
    ],
    source: 'LingRow Daily',
  },

  {
    id: 'a2-plastic-eating-bacteria',
    title: 'Plastic-Eating Bacteria: A Tiny Hope for a Huge Problem',
    subtitle: 'Scientists are engineering microbes that can break down stubborn plastics in days, not centuries.',
    cefr: 'C1',
    readingMin: 5,
    topics: ['science', 'environment'],
    publishedAt: '2026-05-03',
    cover: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1200&q=80',
    body:
`Plastic was supposed to be a miracle. Cheap, durable and infinitely mouldable, it became the defining material of the twentieth century. But that same durability has created an ecological catastrophe: an estimated 8 million tonnes of plastic waste enter the oceans each year, where it persists for hundreds of years.

Now, an unlikely hero is emerging from the laboratory: bacteria. In 2016, Japanese scientists discovered a microbe, Ideonella sakaiensis, that had naturally evolved to digest PET — the plastic used in bottles and packaging. Since then, researchers have refined the bacterium’s key enzymes through genetic engineering, producing variants that can break down PET roughly six times faster than the original.

The implications are profound. If the technology can be scaled, recycling plants might one day soak waste plastic in a warm bath of engineered enzymes and recover the chemical building blocks for new products — closing the loop between waste and resource.

Yet challenges remain. Most marine plastic is mixed with other materials, contaminated by food, or already broken into microscopic fragments that are hard to collect. The energy cost of running large-scale enzyme reactors is also non-trivial. Critics worry that headline-grabbing breakthroughs may distract policymakers from the slower, harder work of reducing plastic production at the source.

Still, the discovery is a striking example of biology answering a problem chemistry could not solve. As one researcher put it: "Nature took 60 years to notice plastic. We may yet learn to be a little patient too."`,
    glossary: [
      { word: 'durable',         defEn: 'able to last a long time',                              defUz: 'mustahkam, uzoq chidaydigan' },
      { word: 'persists',        defEn: 'continues to exist',                                   defUz: 'davom etadi, saqlanib qoladi' },
      { word: 'evolved',         defEn: 'developed gradually',                                  defUz: 'asta-sekin rivojlangan' },
      { word: 'enzyme',          defEn: 'a substance that speeds up chemical reactions',         defUz: 'kimyoviy jarayonlarni tezlashtiradigan modda' },
      { word: 'profound',        defEn: 'very great or significant',                            defUz: 'chuqur, juda muhim' },
      { word: 'contaminated',    defEn: 'made impure by mixing with something harmful',          defUz: 'ifloslangan' },
      { word: 'non-trivial',     defEn: 'not small or easy to ignore',                          defUz: 'jiddiy, e\'tiborga loyiq' },
      { word: 'distract',        defEn: 'to take attention away from something',                 defUz: 'diqqatni chalg‘itmoq' },
    ],
    questions: [
      { prompt: 'What unusual organism does the article focus on?',
        options: ['A new whale species', 'A plastic-digesting bacterium', 'A virus that attacks plants', 'An ocean algae'],
        correct: 1 },
      { prompt: 'What does the writer say is one of the limitations of this approach?',
        options: ['It only works on glass', 'Marine plastic is often broken or mixed', 'It cannot work in cold water', 'It is illegal in most countries'],
        correct: 1 },
      { prompt: 'What is the writer\'s tone overall?',
        options: ['Hopeful but cautious', 'Sarcastic', 'Fearful', 'Dismissive'],
        correct: 0 },
    ],
    source: 'LingRow Daily',
  },

  {
    id: 'a3-science-sleep',
    title: 'Why Your Brain Refuses to Skip Sleep',
    subtitle: 'New research reveals just how thoroughly the brain rebuilds itself overnight — and what happens when it can\'t.',
    cefr: 'B2',
    readingMin: 4,
    topics: ['health', 'science'],
    publishedAt: '2026-05-02',
    cover: 'https://images.unsplash.com/photo-1531353826977-0941b4779a1c?w=1200&q=80',
    body:
`If you have ever pulled an all-nighter, you know the price: blurred thinking, irritability, a strange feeling of being one step behind reality. For decades, scientists puzzled over why our brains insist on switching off for roughly a third of every day. We now have part of the answer.

During deep sleep, the brain runs a kind of cleaning operation. Tiny channels expand, allowing fluid to wash through brain tissue and carry away waste proteins. Among these is beta-amyloid — the very protein that builds up in the brains of Alzheimer\'s patients. In other words, sleep is not just rest; it is maintenance.

Memory benefits even more dramatically. While you are unconscious, the brain replays the day\'s experiences, strengthening the connections that matter and weakening those that don\'t. People who sleep after learning a new skill perform measurably better on it the next day, even if they spend the same number of hours awake studying.

Modern life is not kind to this process. Artificial light, caffeine, late-night screens and irregular schedules all disrupt the body clock. Chronic short sleep is now linked to weight gain, weakened immunity and a higher risk of dementia.

The advice from sleep researchers is unromantic: dim the lights an hour before bed, keep the bedroom cool and dark, and treat your sleep window as seriously as a business meeting. Your brain certainly does.`,
    glossary: [
      { word: 'irritability',    defEn: 'tendency to get annoyed easily',                        defUz: 'tez achchiqlanish, asabiylik' },
      { word: 'puzzled',         defEn: 'confused, unable to understand',                        defUz: "hayron qolgan" },
      { word: 'tissue',          defEn: 'a group of cells with a similar function',              defUz: "to'qima" },
      { word: 'maintenance',     defEn: 'keeping something in good condition',                  defUz: 'parvarish, saqlash' },
      { word: 'measurably',      defEn: 'in a way that can be measured',                        defUz: 'sezilarli darajada' },
      { word: 'disrupt',         defEn: 'to interrupt the normal course of',                    defUz: 'buzmoq, izdan chiqarmoq' },
      { word: 'chronic',         defEn: 'continuing for a long time',                            defUz: 'surunkali, uzoq davom etadigan' },
    ],
    questions: [
      { prompt: 'What does the article say sleep removes from the brain?',
        options: ['Memory of the day', 'Waste proteins', 'Excess sugar', 'Old bacteria'],
        correct: 1 },
      { prompt: 'How does sleep affect learning?',
        options: ['It has no effect', 'It causes you to forget', 'It strengthens useful connections', 'It only helps children'],
        correct: 2 },
      { prompt: "What is the writer\'s recommendation?",
        options: ['Sleep less to do more', 'Treat sleep as seriously as work', 'Use stronger lights at night', 'Skip breakfast'],
        correct: 1 },
    ],
    source: 'LingRow Daily',
  },

  {
    id: 'a4-remote-work-culture',
    title: 'Remote Work, Five Years Later',
    subtitle: 'The pandemic forced an experiment. What did we learn — and what did we lose?',
    cefr: 'B1',
    readingMin: 3,
    topics: ['business', 'work'],
    publishedAt: '2026-05-01',
    cover: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80',
    body:
`In 2020, millions of office workers were sent home. Most expected the change to last weeks. It lasted years.

Five years on, the data is in. Remote work, on average, made employees happier and slightly more productive on routine tasks. People saved hours of commuting and gained back time for family, exercise and sleep. Many companies cut office costs and were able to hire from anywhere.

But the picture is not all bright. Studies show that creative work — the kind that needs unplanned conversations, fast feedback and strong trust — suffers without face-to-face contact. Junior employees report feeling lonelier and less mentored. Managers admit it is harder to spot when someone is struggling.

So a new model is taking shape: hybrid work. Two or three days at the office for collaboration; the rest at home for deep, focused tasks. Companies are redesigning offices around shared rooms rather than personal desks, and many workers are demanding flexibility as a basic condition, not a perk.

The biggest lesson of the experiment is simple: where we work matters less than how. The future will not belong to those who insist on the past, nor to those who reject the office entirely, but to teams that can choose, on any given day, the best place for the job in front of them.`,
    glossary: [
      { word: 'commuting',     defEn: 'travelling regularly between home and work',         defUz: 'ish va uy o\'rtasida muntazam qatnov' },
      { word: 'productive',    defEn: 'achieving a lot in a short time',                   defUz: 'samarali, mahsuldor' },
      { word: 'mentored',      defEn: 'guided by an experienced colleague',                 defUz: 'tajribali hamkasb tomonidan yo\'naltirilgan' },
      { word: 'hybrid',        defEn: 'combining two or more things',                      defUz: 'aralash, ikki tomonlama' },
      { word: 'collaboration', defEn: 'working together with others',                       defUz: 'hamkorlik' },
      { word: 'perk',          defEn: 'an extra benefit beyond pay',                       defUz: "qo'shimcha imtiyoz" },
    ],
    questions: [
      { prompt: 'According to the article, what suffers without face-to-face contact?',
        options: ['Routine tasks', 'Creative work', 'Lunch breaks', 'Commuting'],
        correct: 1 },
      { prompt: 'What is the new working model the article describes?',
        options: ['Fully remote', 'Fully in-office', 'Hybrid', 'Four-day week'],
        correct: 2 },
      { prompt: 'What is the article\'s main conclusion?',
        options: ['The office must return', 'Where matters less than how', 'Remote work is a failure', 'Junior staff should work alone'],
        correct: 1 },
    ],
    source: 'LingRow Daily',
  },

  {
    id: 'a5-why-we-forget-dreams',
    title: 'Why We Forget Our Dreams',
    subtitle: 'Vivid one minute, gone the next — the strange neuroscience of dream amnesia.',
    cefr: 'C2',
    readingMin: 6,
    topics: ['science', 'psychology'],
    publishedAt: '2026-04-30',
    cover: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=1200&q=80',
    body:
`Almost everyone has woken up convinced they have just lived through a vivid story, only to find the details slipping away within seconds. Dreams may seem trivial, but the question of why we forget them so completely has occupied neuroscientists for decades. Recent work suggests the answer is no accident — it is by design.

During REM sleep, when most dreaming takes place, the brain produces extraordinarily low levels of two chemicals essential for converting short-term memories into long-term ones: noradrenaline and serotonin. The hippocampus, the structure that catalogues experience, effectively goes offline. Whatever we experience in this state is therefore born in a memory blackout: vivid in the moment, ephemeral by morning.

Why would evolution build us this way? One leading theory is that the brain uses dream sleep to test bizarre or emotionally charged scenarios without committing them to autobiography. If every dream were remembered, our sense of personal history would quickly become contaminated by content the waking mind never approved.

There is also a more elegant idea: dream amnesia is the price of brain plasticity. While we sleep, neural connections are pruned and rebuilt, making memory itself temporarily unstable. Forgetting dreams may simply be a side effect of a system that is recalibrating in real time.

People who do remember their dreams reliably tend to wake up briefly during or just after REM sleep — a habit that gives the hippocampus a fleeting opportunity to capture the narrative before it dissolves. Practising "dream journaling" for a few weeks can dramatically increase recall, suggesting that the bottleneck is not memory itself but the conditions under which it is encoded.

Whatever the precise mechanism, the lesson of dream research is humbling. The brain we trust to record our days is the same brain that, every night, runs an entirely separate cinema and locks the projection booth before we leave.`,
    glossary: [
      { word: 'vivid',           defEn: 'producing very clear images in the mind',                defUz: 'aniq, jonli (tasvir)' },
      { word: 'trivial',         defEn: 'of little importance',                                  defUz: 'ahamiyatsiz, jiddiy emas' },
      { word: 'catalogues',      defEn: 'systematically lists or stores',                        defUz: 'tizimli ravishda saqlaydi' },
      { word: 'ephemeral',       defEn: 'lasting only a short time',                            defUz: 'qisqa muddatli' },
      { word: 'autobiography',   defEn: 'an account of a person\'s own life',                   defUz: 'avtobiografiya, shaxsiy hayot tarixi' },
      { word: 'contaminated',    defEn: 'made impure',                                           defUz: 'ifloslangan, buzilgan' },
      { word: 'plasticity',      defEn: 'ability to change and adapt',                           defUz: 'moslashuvchanlik' },
      { word: 'pruned',          defEn: 'cut back, trimmed away',                                defUz: 'kesilgan, qisqartirilgan' },
      { word: 'fleeting',        defEn: 'lasting for a very short time',                        defUz: 'tez o\'tib ketadigan' },
      { word: 'humbling',        defEn: 'making one feel modest or less important',              defUz: 'kamtarlikka undaydigan' },
    ],
    questions: [
      { prompt: 'During REM sleep, the levels of which chemicals are very low?',
        options: ['Adrenaline and dopamine', 'Noradrenaline and serotonin', 'Cortisol and insulin', 'Melatonin only'],
        correct: 1 },
      { prompt: 'What does the article suggest is one possible reason we forget dreams?',
        options: ["To save energy", 'To protect our sense of personal history', 'To prevent insomnia', 'To improve eyesight'],
        correct: 1 },
      { prompt: 'According to the article, what habit can help people remember dreams?',
        options: ['Sleeping in total silence', 'Dream journaling', 'Eating before bed', 'Avoiding caffeine'],
        correct: 1 },
      { prompt: "What is the writer\'s closing tone?",
        options: ['Reverent and reflective', 'Angry', 'Worried', 'Humorous and dismissive'],
        correct: 0 },
    ],
    source: 'LingRow Daily',
  },
];

// -----------------------------------------------------------------------------

/** Combined pool: built-in + user-uploaded articles. Pass user list explicitly. */
export function getAllArticles(userList: Article[] = []): Article[] {
  // user articles first (newest), then built-in
  return [...userList, ...ARTICLES];
}

export function getArticleById(id: string, userList: Article[] = []): Article | undefined {
  return getAllArticles(userList).find(a => a.id === id);
}

export function getTodaysArticle(userList: Article[] = []): Article {
  const all = getAllArticles(userList);
  const dayIndex = Math.floor(Date.now() / 86_400_000) % all.length;
  return all[dayIndex];
}

export function searchArticles(query: string, levels: Set<string>, topics: Set<string>, userList: Article[] = []): Article[] {
  const q = query.trim().toLowerCase();
  return getAllArticles(userList).filter(a => {
    if (levels.size > 0 && !levels.has(a.cefr)) return false;
    if (topics.size > 0 && !a.topics.some(t => topics.has(t))) return false;
    if (!q) return true;
    return [a.title, a.subtitle ?? '', a.body, ...a.topics].join(' ').toLowerCase().includes(q);
  });
}

export const ALL_ARTICLE_TOPICS = Array.from(
  new Set(ARTICLES.flatMap(a => a.topics))
).sort();

/** Common predefined topics shown as suggestions in the editor. */
export const TOPIC_SUGGESTIONS = [
  'technology', 'science', 'environment', 'health', 'business', 'work',
  'education', 'psychology', 'history', 'culture', 'politics', 'sports',
  'travel', 'food', 'art', 'music', 'literature', 'philosophy',
];
