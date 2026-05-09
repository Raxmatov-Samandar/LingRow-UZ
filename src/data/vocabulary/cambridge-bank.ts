// =============================================================================
// Cambridge-style English ↔ Uzbek dictionary entries.
// Each entry follows the Cambridge Dictionary information model:
//  • CEFR level per headword AND per sense
//  • UK + US pronunciation
//  • Multiple senses (each with own POS, grammar, definition, examples)
//  • Synonyms, antonyms, collocations, register
//  • Word family, etymology, idioms
//  • Topics
// =============================================================================

export type CEFR  = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type POS   = 'noun' | 'verb' | 'adj' | 'adv' | 'phrase' | 'idiom' | 'phrasal verb' | 'preposition' | 'conjunction';
export type Register = 'formal' | 'informal' | 'literary' | 'old-fashioned' | 'humorous' | 'specialized' | 'disapproving';

export interface Pronunciation {
  uk: string;        // IPA
  us: string;
  /** Audio path under /public/audio/dict/ (optional). */
  audio?: { uk?: string; us?: string };
}

export interface Example  { en: string; uz: string; }
export interface Sense {
  pos:           POS;
  grammar?:      string;            // "[C]", "[U]", "[T]", "[I]", "[+ that]"
  cefr?:         CEFR;
  register?:     Register;
  defEn:         string;
  defUz:         string;
  examples:      Example[];
  synonyms?:     string[];
  antonyms?:     string[];
  collocations?: string[];
}

export interface Idiom {
  phrase:        string;
  meaningEn:     string;
  meaningUz:     string;
  example?:      string;
}

export interface WordFamilyEntry { word: string; pos: POS; }

export interface DictEntry {
  id:            string;
  headword:      string;
  uz:            string;             // primary single-word UZ translation
  uzAlt?:        string[];
  cefr:          CEFR;
  pron:          Pronunciation;
  senses:        Sense[];
  wordFamily?:   WordFamilyEntry[];
  etymology?:    string;
  idioms?:       Idiom[];
  topics?:       string[];           // ['business', 'academic', 'environment']
}

// -----------------------------------------------------------------------------

export const CAMBRIDGE_BANK: DictEntry[] = [
  // ═══════════════════════════ A1 / A2 / B1 ═══════════════════════════
  {
    id: 'cw-hello', headword: 'hello', uz: 'salom', cefr: 'A1',
    pron: { uk: '/heˈləʊ/', us: '/heˈloʊ/' },
    senses: [
      { pos: 'interjection' as POS, cefr: 'A1',
        defEn: 'Used when meeting or greeting someone.',
        defUz: 'Birovni uchratganda yoki salomlashganda ishlatiladi.',
        examples: [
          { en: 'Hello, how are you?', uz: 'Salom, qalaysiz?' },
          { en: 'I just called to say hello.', uz: 'Faqat salom aytish uchun qo\'ng\'iroq qildim.' },
        ],
        synonyms: ['hi', 'hey', 'greetings'] },
    ],
    topics: ['greetings'],
  },

  // ═══════════════════════════ B1 / B2 ═══════════════════════════
  {
    id: 'cw-decide', headword: 'decide', uz: 'qaror qilmoq', cefr: 'A2',
    pron: { uk: '/dɪˈsaɪd/', us: '/dɪˈsaɪd/' },
    senses: [
      { pos: 'verb', grammar: '[I or T]', cefr: 'A2',
        defEn: 'To choose something, especially after thinking carefully about several possibilities.',
        defUz: 'Bir nechta imkoniyatlardan diqqat bilan o\'ylab so\'ng tanlamoq.',
        examples: [
          { en: 'They have to decide by next Friday.',                 uz: 'Ular keyingi juma kuniga qadar qaror qilishlari kerak.' },
          { en: 'I can\'t decide whether to stay or leave.',           uz: 'Qolish yoki ketishni tanlay olmayapman.' },
        ],
        synonyms: ['choose', 'determine', 'resolve'],
        collocations: ['decide on something', 'decide against', 'decide to do'] },
      { pos: 'verb', grammar: '[T]', cefr: 'B2', register: 'formal',
        defEn: 'To cause someone to make a particular choice.',
        defUz: 'Birovga ma\'lum bir tanlovni qildirmoq.',
        examples: [
          { en: 'What finally decided you to leave the company?',      uz: 'Sizni kompaniyani tark etishga nima qaror qildirdi?' },
        ] },
    ],
    wordFamily: [
      { word: 'decision',     pos: 'noun' },
      { word: 'decisive',     pos: 'adj'  },
      { word: 'decisively',   pos: 'adv'  },
      { word: 'undecided',    pos: 'adj'  },
    ],
    etymology: "From Latin dēcīdere — 'to cut off, settle' (de- 'off' + caedere 'to cut').",
    idioms: [
      { phrase: 'decide between (two things)',
        meaningEn: 'To choose one of two options.',
        meaningUz: 'Ikkita variantdan birini tanlash.',
        example: 'I had to decide between the two job offers.' },
    ],
    topics: ['daily', 'business'],
  },

  {
    id: 'cw-improve', headword: 'improve', uz: 'yaxshilamoq', cefr: 'A2',
    pron: { uk: '/ɪmˈpruːv/', us: '/ɪmˈpruːv/' },
    senses: [
      { pos: 'verb', grammar: '[I or T]', cefr: 'A2',
        defEn: 'To make or become better.',
        defUz: 'Yaxshiroq qilmoq yoki bo\'lmoq.',
        examples: [
          { en: 'His health is improving slowly.',                                           uz: 'Sog\'lig\'i asta-sekin yaxshilanmoqda.' },
          { en: 'I need to improve my writing skills before the IELTS exam.',                uz: 'IELTS imtihonidan oldin yozish ko\'nikmalarimni yaxshilashim kerak.' },
        ],
        synonyms: ['enhance', 'upgrade', 'refine'],
        antonyms: ['worsen', 'deteriorate'],
        collocations: ['improve dramatically', 'improve gradually', 'room for improvement'] },
    ],
    wordFamily: [
      { word: 'improvement', pos: 'noun' },
      { word: 'improved',    pos: 'adj'  },
    ],
    topics: ['study', 'work'],
  },

  // ═══════════════════════════ B2 ═══════════════════════════
  {
    id: 'cw-significant', headword: 'significant', uz: 'sezilarli, muhim', cefr: 'B2',
    pron: { uk: '/sɪɡˈnɪf.ɪ.kənt/', us: '/sɪɡˈnɪf.ə.kənt/' },
    senses: [
      { pos: 'adj', cefr: 'B2',
        defEn: 'Important or noticeable.',
        defUz: 'Muhim yoki sezilarli.',
        examples: [
          { en: 'There has been a significant increase in food prices.', uz: 'Oziq-ovqat narxlarida sezilarli o\'sish kuzatildi.' },
          { en: 'A significant number of students failed the exam.',     uz: 'Talabalarning katta qismi imtihondan o\'ta olmadi.' },
        ],
        synonyms: ['important', 'considerable', 'notable', 'substantial'],
        antonyms: ['insignificant', 'minor', 'negligible'],
        collocations: ['statistically significant', 'a significant role', 'significant impact'] },
      { pos: 'adj', cefr: 'C1', register: 'formal',
        defEn: 'Suggesting a meaning that is not immediately obvious.',
        defUz: 'Darhol ko\'rinmaydigan ma\'noni anglatuvchi.',
        examples: [
          { en: 'She gave me a significant glance.', uz: 'U menga ma\'noli nigoh tashladi.' },
        ] },
    ],
    wordFamily: [
      { word: 'significance',   pos: 'noun' },
      { word: 'significantly',  pos: 'adv'  },
      { word: 'insignificant',  pos: 'adj'  },
    ],
    topics: ['ielts', 'academic'],
  },

  // ═══════════════════════════ C1 ═══════════════════════════
  {
    id: 'cw-crucial', headword: 'crucial', uz: 'hal qiluvchi, muhim', cefr: 'B2',
    pron: { uk: '/ˈkruː.ʃəl/', us: '/ˈkruː.ʃəl/' },
    senses: [
      { pos: 'adj', cefr: 'B2',
        defEn: 'Extremely important or necessary.',
        defUz: 'Juda muhim yoki zarur.',
        examples: [
          { en: 'Practice is crucial for IELTS success.',          uz: 'IELTSda muvaffaqiyat uchun mashq hal qiluvchidir.' },
          { en: 'This decision is crucial to our future.',         uz: 'Bu qaror kelajagimiz uchun hal qiluvchidir.' },
        ],
        synonyms: ['vital', 'essential', 'pivotal', 'imperative', 'critical'],
        antonyms: ['unimportant', 'trivial'],
        collocations: ['crucial role', 'crucial moment', 'crucial decision', 'absolutely crucial'] },
    ],
    wordFamily: [{ word: 'crucially', pos: 'adv' }],
    etymology: "From Latin crux 'cross', meaning a decisive point — like a crossroads.",
    topics: ['ielts', 'academic'],
  },

  {
    id: 'cw-pivotal', headword: 'pivotal', uz: 'asosiy, markaziy, hal qiluvchi', cefr: 'C1',
    pron: { uk: '/ˈpɪv.ə.təl/', us: '/ˈpɪv.ə.t̬əl/' },
    senses: [
      { pos: 'adj', cefr: 'C1', register: 'formal',
        defEn: 'Of vital importance because something else depends on it.',
        defUz: 'Boshqa bir narsa unga bog\'liq bo\'lganligi sababli, hayotiy ahamiyatga ega.',
        examples: [
          { en: 'She played a pivotal role in the negotiations.',      uz: 'U muzokaralarda markaziy rol o\'ynadi.' },
          { en: '1969 was a pivotal year in the company\'s history.',  uz: '1969-yil kompaniya tarixida hal qiluvchi yil edi.' },
        ],
        synonyms: ['crucial', 'central', 'key', 'critical'],
        collocations: ['pivotal role', 'pivotal moment', 'pivotal figure'] },
    ],
    wordFamily: [{ word: 'pivot', pos: 'noun' }, { word: 'pivot', pos: 'verb' }],
    topics: ['ielts', 'academic', 'business'],
  },

  {
    id: 'cw-procrastinate', headword: 'procrastinate', uz: 'ishni keyinga qoldirmoq', cefr: 'C1',
    pron: { uk: '/prəˈkræs.tɪ.neɪt/', us: '/proʊˈkræs.tə.neɪt/' },
    senses: [
      { pos: 'verb', grammar: '[I]', cefr: 'C1', register: 'disapproving',
        defEn: 'To keep delaying something that must be done, often because it is unpleasant or boring.',
        defUz: 'Bajarilishi kerak bo\'lgan ishni — odatda u yoqimsiz yoki zerikarli bo\'lgani uchun — kechiktirib boravermoq.',
        examples: [
          { en: "I know I have to deal with the problem at some point — I'm just procrastinating.",
            uz: 'Bu muammoni bir kun hal qilishim kerakligini bilaman — shunchaki ishni keyinga qoldirayapman.' },
          { en: 'Stop procrastinating and start your essay.',
            uz: 'Ishni keyinga qoldirishni bas qil va inshongni yozishni boshla.' },
        ],
        synonyms: ['delay', 'postpone', 'put off', 'stall'],
        antonyms: ['hasten', 'accelerate'],
        collocations: ['stop procrastinating'] },
    ],
    wordFamily: [
      { word: 'procrastination', pos: 'noun' },
      { word: 'procrastinator',  pos: 'noun' },
    ],
    etymology: "From Latin procrastinare — 'to defer until tomorrow' (pro- 'forward' + crastinus 'of tomorrow').",
    idioms: [
      { phrase: 'Procrastination is the thief of time.',
        meaningEn: 'Delaying tasks robs you of precious time.',
        meaningUz: 'Ishni keyinga qoldirish — vaqt o\'g\'risi.' },
    ],
    topics: ['ielts', 'study'],
  },

  {
    id: 'cw-comprehensive', headword: 'comprehensive', uz: 'keng qamrovli', cefr: 'B2',
    pron: { uk: '/ˌkɒm.prɪˈhen.sɪv/', us: '/ˌkɑːm.prəˈhen.sɪv/' },
    senses: [
      { pos: 'adj', cefr: 'B2',
        defEn: 'Complete and including everything that is necessary.',
        defUz: 'To\'liq va kerakli bo\'lgan barcha narsani o\'z ichiga oluvchi.',
        examples: [
          { en: 'A comprehensive guide to Italian wines.',                                     uz: 'Italiya vinolari bo\'yicha keng qamrovli qo\'llanma.' },
          { en: 'The book provides a comprehensive overview of the subject.',                  uz: 'Kitob mavzu bo\'yicha keng qamrovli umumiy ma\'lumot beradi.' },
        ],
        synonyms: ['complete', 'thorough', 'exhaustive', 'extensive'],
        antonyms: ['partial', 'incomplete', 'narrow'],
        collocations: ['comprehensive review', 'comprehensive analysis', 'comprehensive understanding'] },
    ],
    wordFamily: [
      { word: 'comprehensively', pos: 'adv' },
      { word: 'comprehensiveness', pos: 'noun' },
    ],
    topics: ['ielts', 'academic'],
  },

  // ═══════════════════════════ C2 / sophisticated ═══════════════════════════
  {
    id: 'cw-ubiquitous', headword: 'ubiquitous', uz: 'hamma joyda mavjud', cefr: 'C2',
    pron: { uk: '/juːˈbɪk.wɪ.təs/', us: '/juːˈbɪk.wə.t̬əs/' },
    senses: [
      { pos: 'adj', cefr: 'C2', register: 'formal',
        defEn: 'Seeming to be everywhere.',
        defUz: 'Go\'yo hamma joyda bor — keng tarqalgan.',
        examples: [
          { en: 'The mobile phone has become ubiquitous in modern life.',  uz: 'Mobil telefon zamonaviy hayotda hamma joyda uchraydigan narsaga aylandi.' },
          { en: "Coffee shops are ubiquitous in Italy.",                    uz: "Italiyada qahvaxonalar hamma joyda mavjud." },
        ],
        synonyms: ['omnipresent', 'pervasive', 'everywhere', 'widespread'],
        antonyms: ['rare', 'scarce'],
        collocations: ['ubiquitous presence', 'become ubiquitous'] },
    ],
    wordFamily: [
      { word: 'ubiquity',     pos: 'noun' },
      { word: 'ubiquitously', pos: 'adv'  },
    ],
    etymology: "From Latin ubique — 'everywhere'.",
    topics: ['ielts', 'tech', 'academic'],
  },

  {
    id: 'cw-ephemeral', headword: 'ephemeral', uz: 'qisqa muddatli', cefr: 'C2',
    pron: { uk: '/ɪˈfem.ər.əl/', us: '/əˈfem.ɚ.əl/' },
    senses: [
      { pos: 'adj', cefr: 'C2', register: 'literary',
        defEn: 'Lasting for only a short time.',
        defUz: 'Faqat qisqa vaqt davom etadigan.',
        examples: [
          { en: 'Fashions are ephemeral, but style endures.',          uz: 'Modalar qisqa muddatli, ammo uslub abadiy.' },
          { en: 'The pleasure of internet fame is ephemeral.',         uz: 'Internet shuhratining lazzati qisqa muddatli.' },
        ],
        synonyms: ['fleeting', 'transient', 'transitory', 'short-lived'],
        antonyms: ['permanent', 'enduring', 'eternal'] },
    ],
    etymology: "From Greek ephēmeros — 'lasting only a day'.",
    topics: ['ielts', 'literary'],
  },

  {
    id: 'cw-meticulous', headword: 'meticulous', uz: 'sinchkov, e\'tiborli', cefr: 'C1',
    pron: { uk: '/məˈtɪk.jə.ləs/', us: '/məˈtɪk.jə.ləs/' },
    senses: [
      { pos: 'adj', cefr: 'C1',
        defEn: 'Very careful and with great attention to every detail.',
        defUz: 'Juda ehtiyotkor, har bir mayda detalga katta e\'tibor beradigan.',
        examples: [
          { en: 'He had spent some time meticulously cleaning every part of the engine.',
            uz: 'U dvigatelning har bir qismini sinchkovlik bilan tozalashga vaqt sarflagan edi.' },
          { en: 'A meticulous approach to research is essential in academia.',
            uz: 'Akademiyada tadqiqotga sinchkov yondashuv juda muhim.' },
        ],
        synonyms: ['thorough', 'painstaking', 'fastidious', 'scrupulous'],
        antonyms: ['careless', 'sloppy'],
        collocations: ['meticulous attention to detail', 'meticulous planning', 'meticulous research'] },
    ],
    wordFamily: [
      { word: 'meticulously',  pos: 'adv'  },
      { word: 'meticulousness', pos: 'noun' },
    ],
    topics: ['ielts', 'work', 'academic'],
  },

  {
    id: 'cw-mitigate', headword: 'mitigate', uz: 'yumshatmoq, kuchsizlantirmoq', cefr: 'C2',
    pron: { uk: '/ˈmɪt.ɪ.ɡeɪt/', us: '/ˈmɪt̬.ə.ɡeɪt/' },
    senses: [
      { pos: 'verb', grammar: '[T]', cefr: 'C2', register: 'formal',
        defEn: 'To make something less harmful, unpleasant, or bad.',
        defUz: 'Biror narsani kamroq zararli, yoqimsiz yoki yomon qilish.',
        examples: [
          { en: 'It is unclear how to mitigate the effects of tourism on the islands.',
            uz: 'Turizmning orollarga ta\'sirini qanday yumshatish noaniq.' },
          { en: 'Vaccines mitigate the severity of the disease.',
            uz: 'Vaksinalar kasallikning og\'irligini yumshatadi.' },
        ],
        synonyms: ['alleviate', 'reduce', 'ease', 'lessen', 'temper'],
        antonyms: ['exacerbate', 'aggravate', 'worsen'],
        collocations: ['mitigate the effects', 'mitigate the risk', 'mitigate the impact'] },
    ],
    wordFamily: [
      { word: 'mitigation',     pos: 'noun' },
      { word: 'mitigating',     pos: 'adj'  },
      { word: 'unmitigated',    pos: 'adj'  },
    ],
    etymology: "From Latin mitigare — 'to soften' (mitis 'soft, mild' + agere 'to do').",
    topics: ['ielts', 'environment', 'business'],
  },

  {
    id: 'cw-exacerbate', headword: 'exacerbate', uz: 'battarroq qilmoq, kuchaytirmoq', cefr: 'C2',
    pron: { uk: '/ɪɡˈzæs.ə.beɪt/', us: '/ɪɡˈzæs.ɚ.beɪt/' },
    senses: [
      { pos: 'verb', grammar: '[T]', cefr: 'C2', register: 'formal',
        defEn: 'To make something that is already bad even worse.',
        defUz: 'Allaqachon yomon bo\'lgan narsani yanada yomonroq qilish.',
        examples: [
          { en: 'The president\'s comments only exacerbated the tension.',
            uz: "Prezidentning so\'zlari faqat keskinlikni battarroq qildi." },
          { en: 'Pollution can exacerbate respiratory problems.',
            uz: "Ifloslanish nafas muammolarini kuchaytirishi mumkin." },
        ],
        synonyms: ['aggravate', 'worsen', 'compound', 'intensify'],
        antonyms: ['mitigate', 'alleviate', 'ease'],
        collocations: ['exacerbate the problem', 'exacerbate tensions'] },
    ],
    wordFamily: [{ word: 'exacerbation', pos: 'noun' }],
    etymology: "From Latin exacerbare — 'to provoke, irritate' (ex- 'thoroughly' + acerbus 'harsh, bitter').",
    topics: ['ielts', 'academic', 'environment'],
  },

  {
    id: 'cw-juxtaposition', headword: 'juxtaposition', uz: 'yonma-yon qo\'yish, qarama-qarshilik', cefr: 'C2',
    pron: { uk: '/ˌdʒʌk.stə.pəˈzɪʃ.ən/', us: '/ˌdʒʌk.stə.pəˈzɪʃ.ən/' },
    senses: [
      { pos: 'noun', grammar: '[C or U]', cefr: 'C2', register: 'formal',
        defEn: 'The act of placing two or more things side by side, often to highlight contrast.',
        defUz: 'Ikki yoki undan ortiq narsani yonma-yon qo\'yish — odatda farqni ta\'kidlash uchun.',
        examples: [
          { en: 'The juxtaposition of luxury and poverty in the city is striking.',
            uz: 'Shahardagi hashamat va qashshoqlikning yonma-yonligi ko\'zga tashlanadi.' },
          { en: 'The film uses an effective juxtaposition of past and present.',
            uz: "Film o'tmish va hozirgi zamonning samarali qarama-qarshiligidan foydalanadi." },
        ],
        synonyms: ['contrast', 'comparison', 'pairing'],
        collocations: ['stark juxtaposition', 'striking juxtaposition'] },
    ],
    wordFamily: [{ word: 'juxtapose', pos: 'verb' }],
    etymology: "From Latin juxta 'next to' + position.",
    topics: ['ielts', 'literary', 'academic'],
  },

  {
    id: 'cw-pernicious', headword: 'pernicious', uz: 'zararli, halokatli', cefr: 'C2',
    pron: { uk: '/pəˈnɪʃ.əs/', us: '/pɚˈnɪʃ.əs/' },
    senses: [
      { pos: 'adj', cefr: 'C2', register: 'formal',
        defEn: 'Having a harmful effect, especially in a gradual or subtle way.',
        defUz: "Asta-sekin yoki yashirin tarzda zarar yetkazadigan.",
        examples: [
          { en: "Smoking is having a pernicious effect on the population's health.",
            uz: "Chekish aholi salomatligiga halokatli ta\'sir ko\'rsatmoqda." },
          { en: 'The pernicious influence of social media on teenagers is well documented.',
            uz: 'Ijtimoiy tarmoqlarning o\'smirlarga halokatli ta\'siri yaxshi hujjatlashtirilgan.' },
        ],
        synonyms: ['harmful', 'destructive', 'detrimental', 'malign'],
        antonyms: ['beneficial', 'wholesome', 'benign'] },
    ],
    wordFamily: [{ word: 'perniciously', pos: 'adv' }],
    etymology: "From Latin perniciosus 'destructive' (per- 'thoroughly' + nex 'death').",
    topics: ['ielts', 'health', 'academic'],
  },

  {
    id: 'cw-resilient', headword: 'resilient', uz: 'bardoshli, mustahkam', cefr: 'C1',
    pron: { uk: '/rɪˈzɪl.i.ənt/', us: '/rɪˈzɪl.jənt/' },
    senses: [
      { pos: 'adj', cefr: 'C1',
        defEn: 'Able to recover quickly after something unpleasant such as shock, injury, etc.',
        defUz: "Zarba, jarohat va shu kabi noxush hodisadan keyin tez tiklana oladigan.",
        examples: [
          { en: 'Children are often very resilient to setbacks.',                                  uz: 'Bolalar ko\'pincha mag\'lubiyatga juda bardoshli bo\'ladi.' },
          { en: 'The economy proved more resilient than expected.',                                 uz: "Iqtisod kutilganidan ko\'ra bardoshliroq bo\'lib chiqdi." },
        ],
        synonyms: ['tough', 'hardy', 'flexible', 'durable'],
        antonyms: ['vulnerable', 'fragile'],
        collocations: ['emotionally resilient', 'resilient economy', 'resilient material'] },
    ],
    wordFamily: [{ word: 'resilience', pos: 'noun' }, { word: 'resiliency', pos: 'noun' }],
    topics: ['feelings', 'business', 'ielts'],
  },

  {
    id: 'cw-pragmatic', headword: 'pragmatic', uz: 'amaliy, pragmatik', cefr: 'C1',
    pron: { uk: '/præɡˈmæt.ɪk/', us: '/præɡˈmæt̬.ɪk/' },
    senses: [
      { pos: 'adj', cefr: 'C1',
        defEn: 'Solving problems in a sensible way that suits the conditions that really exist now, rather than obeying fixed theories, ideas, or rules.',
        defUz: "Aniq nazariyalar yoki qoidalarga emas, balki hozirgi sharoitga mos keladigan oqilona yo\'l bilan muammolarni hal qiladigan.",
        examples: [
          { en: 'In business, it pays to be pragmatic.',                                           uz: 'Biznesda pragmatik bo\'lish foyda keltiradi.' },
          { en: 'We need a pragmatic approach to the problem.',                                    uz: 'Muammoga pragmatik yondashuv kerak.' },
        ],
        synonyms: ['practical', 'realistic', 'sensible', 'down-to-earth'],
        antonyms: ['idealistic', 'impractical'],
        collocations: ['pragmatic approach', 'pragmatic solution', 'pragmatic decision'] },
    ],
    wordFamily: [
      { word: 'pragmatism',   pos: 'noun' },
      { word: 'pragmatist',   pos: 'noun' },
      { word: 'pragmatically', pos: 'adv' },
    ],
    topics: ['ielts', 'business', 'academic'],
  },

  {
    id: 'cw-sustainable', headword: 'sustainable', uz: 'barqaror, davomli', cefr: 'B2',
    pron: { uk: '/səˈsteɪ.nə.bəl/', us: '/səˈsteɪ.nə.bəl/' },
    senses: [
      { pos: 'adj', cefr: 'B2',
        defEn: 'Able to continue over a period of time.',
        defUz: 'Ma\'lum bir vaqt davomida davom etish qobiliyatiga ega.',
        examples: [
          { en: 'That sort of extreme diet is not sustainable over a long period.', uz: 'Bunday qattiq dieta uzoq vaqt davomida barqaror emas.' },
        ] },
      { pos: 'adj', cefr: 'B2',
        defEn: 'Causing little or no damage to the environment and able to continue for a long time.',
        defUz: 'Atrof-muhitga kam zarar yoki umuman zarar yetkazmaydigan, uzoq vaqt davom eta oladigan.',
        examples: [
          { en: 'Sustainable energy sources include wind and solar power.', uz: "Barqaror energiya manbalariga shamol va quyosh energiyasi kiradi." },
          { en: 'We need a more sustainable approach to development.',      uz: 'Bizga rivojlanishga ko\'proq barqaror yondashuv kerak.' },
        ],
        synonyms: ['renewable', 'eco-friendly', 'green'],
        antonyms: ['unsustainable'],
        collocations: ['sustainable development', 'sustainable energy', 'sustainable growth'] },
    ],
    wordFamily: [
      { word: 'sustain',       pos: 'verb' },
      { word: 'sustainability', pos: 'noun' },
      { word: 'sustainably',   pos: 'adv' },
    ],
    topics: ['ielts', 'environment', 'business'],
  },

  {
    id: 'cw-equivocate', headword: 'equivocate', uz: "ikki ma'noli gapirmoq", cefr: 'C2',
    pron: { uk: '/ɪˈkwɪv.ə.keɪt/', us: '/ɪˈkwɪv.ə.keɪt/' },
    senses: [
      { pos: 'verb', grammar: '[I]', cefr: 'C2', register: 'formal',
        defEn: 'To speak in a way that allows you to avoid stating the truth or making a clear decision (often disapproving).',
        defUz: "Haqiqatni aytishdan yoki aniq qaror chiqarishdan qochish uchun ikki ma'noli gapirmoq.",
        examples: [
          { en: 'Stop equivocating and tell us what you really think.',
            uz: "Ikki ma'noli gapirishni bas qil va aslida nima o\'ylaganingni ayt." },
        ],
        synonyms: ['hedge', 'prevaricate', 'beat about the bush'],
        antonyms: ['be straightforward', 'clarify'] },
    ],
    wordFamily: [
      { word: 'equivocal',    pos: 'adj' },
      { word: 'equivocation', pos: 'noun' },
    ],
    topics: ['ielts', 'academic'],
  },

  {
    id: 'cw-ameliorate', headword: 'ameliorate', uz: 'yaxshilash, yumshatish', cefr: 'C2',
    pron: { uk: '/əˈmiː.li.ə.reɪt/', us: '/əˈmiːl.jə.reɪt/' },
    senses: [
      { pos: 'verb', grammar: '[T]', cefr: 'C2', register: 'formal',
        defEn: 'To make a bad or unpleasant situation better.',
        defUz: 'Yomon yoki yoqimsiz vaziyatni yaxshilash.',
        examples: [
          { en: 'Foreign aid is being used to ameliorate the effects of the famine.',
            uz: 'Chet el yordami ochlik oqibatlarini yumshatish uchun ishlatilmoqda.' },
        ],
        synonyms: ['improve', 'mitigate', 'enhance'],
        antonyms: ['worsen', 'aggravate'] },
    ],
    wordFamily: [{ word: 'amelioration', pos: 'noun' }],
    etymology: "From Latin via French — 'to make better'.",
    topics: ['ielts', 'academic'],
  },

  {
    id: 'cw-circumspect', headword: 'circumspect', uz: 'ehtiyotkor', cefr: 'C2',
    pron: { uk: '/ˈsɜː.kəm.spekt/', us: '/ˈsɝː.kəm.spekt/' },
    senses: [
      { pos: 'adj', cefr: 'C2', register: 'formal',
        defEn: 'Careful not to take risks or to do anything that could create problems.',
        defUz: 'Xavf-xatarni va muammo tug\'dirishi mumkin bo\'lgan hech narsa qilmaslikda ehtiyotkor.',
        examples: [
          { en: 'The bank should have been more circumspect in its dealings.', uz: 'Bank o\'z muomalalarida ehtiyotkorroq bo\'lishi kerak edi.' },
        ],
        synonyms: ['cautious', 'wary', 'prudent', 'guarded'],
        antonyms: ['reckless', 'rash', 'incautious'] },
    ],
    wordFamily: [
      { word: 'circumspection', pos: 'noun' },
      { word: 'circumspectly',  pos: 'adv'  },
    ],
    topics: ['ielts', 'business'],
  },

  {
    id: 'cw-vehement', headword: 'vehement', uz: 'shiddatli, qattiq', cefr: 'C2',
    pron: { uk: '/ˈviː.ə.mənt/', us: '/ˈviː.ə.mənt/' },
    senses: [
      { pos: 'adj', cefr: 'C2', register: 'formal',
        defEn: 'Expressing very strong feelings, or showing great energy or force.',
        defUz: 'Juda kuchli his-tuyg\'ularni ifodalovchi yoki katta kuch namoyon qiluvchi.',
        examples: [
          { en: 'A vehement opponent of the death penalty.',                                       uz: 'O\'lim jazosining shiddatli raqibi.' },
          { en: 'She delivered a vehement speech against corruption.',                              uz: 'U korrupsiyaga qarshi shiddatli nutq so\'zladi.' },
        ],
        synonyms: ['passionate', 'fervent', 'intense', 'forceful'],
        antonyms: ['mild', 'apathetic', 'weak'],
        collocations: ['vehement opposition', 'vehement denial', 'vehement protest'] },
    ],
    wordFamily: [{ word: 'vehemence', pos: 'noun' }, { word: 'vehemently', pos: 'adv' }],
    topics: ['ielts', 'literary', 'academic'],
  },

  {
    id: 'cw-magnanimous', headword: 'magnanimous', uz: 'oliyhimmat, kechirimli', cefr: 'C2',
    pron: { uk: '/mæɡˈnæn.ɪ.məs/', us: '/mæɡˈnæn.ə.məs/' },
    senses: [
      { pos: 'adj', cefr: 'C2', register: 'formal',
        defEn: 'Generous, kind, and forgiving — especially towards an enemy or rival.',
        defUz: "Saxiy, mehribon va kechirimli — ayniqsa dushman yoki raqibga nisbatan.",
        examples: [
          { en: 'The president was magnanimous in victory.',                                       uz: "Prezident g\'alabada oliyhimmat bo\'ldi." },
          { en: 'She was magnanimous enough to forgive him.',                                       uz: 'U uni kechirishga yetarli darajada oliyhimmat edi.' },
        ],
        synonyms: ['generous', 'noble', 'big-hearted'],
        antonyms: ['vindictive', 'mean-spirited'] },
    ],
    wordFamily: [{ word: 'magnanimity', pos: 'noun' }, { word: 'magnanimously', pos: 'adv' }],
    etymology: "From Latin magnus 'great' + animus 'soul'.",
    topics: ['ielts', 'literary'],
  },

  {
    id: 'cw-quintessential', headword: 'quintessential', uz: 'eng tipik, mukammal namuna', cefr: 'C2',
    pron: { uk: '/ˌkwɪn.tɪˈsen.ʃəl/', us: '/ˌkwɪn.təˈsen.ʃəl/' },
    senses: [
      { pos: 'adj', cefr: 'C2', register: 'formal',
        defEn: 'Being the most typical example or most important part of something.',
        defUz: 'Biror narsaning eng tipik namunasi yoki eng muhim qismi bo\'lgan.',
        examples: [
          { en: 'Sherlock Holmes is the quintessential detective.',                                 uz: 'Sherlok Xolms — eng tipik detektiv.' },
          { en: 'A red bus is a quintessential symbol of London.',                                   uz: "Qizil avtobus — Londonning eng tipik ramzi." },
        ],
        synonyms: ['archetypal', 'typical', 'classic', 'definitive'] },
    ],
    wordFamily: [{ word: 'quintessence', pos: 'noun' }, { word: 'quintessentially', pos: 'adv' }],
    topics: ['ielts', 'literary'],
  },

  {
    id: 'cw-paradigm', headword: 'paradigm', uz: "andoza, namuna, dunyoqarash", cefr: 'C2',
    pron: { uk: '/ˈpær.ə.daɪm/', us: '/ˈper.ə.daɪm/' },
    senses: [
      { pos: 'noun', grammar: '[C]', cefr: 'C2', register: 'formal',
        defEn: 'A model of something, or a very clear and typical example of something.',
        defUz: "Biror narsaning modeli yoki juda aniq va tipik namunasi.",
        examples: [
          { en: 'These works offer a new paradigm for modernist art.',  uz: 'Bu asarlar modernist san\'at uchun yangi andoza taqdim etadi.' },
          { en: 'A paradigm shift in scientific thinking.',              uz: 'Ilmiy tafakkurda paradigma siljishi.' },
        ],
        synonyms: ['model', 'pattern', 'archetype', 'framework'],
        collocations: ['paradigm shift', 'new paradigm', 'dominant paradigm'] },
    ],
    wordFamily: [{ word: 'paradigmatic', pos: 'adj' }],
    topics: ['ielts', 'academic', 'tech'],
  },

  {
    id: 'cw-plethora', headword: 'plethora', uz: "mo'l-ko'lchilik, ortiqcha miqdor", cefr: 'C2',
    pron: { uk: '/ˈpleθ.ər.ə/', us: '/ˈpleθ.ɚ.ə/' },
    senses: [
      { pos: 'noun', grammar: '[S]', cefr: 'C2', register: 'formal',
        defEn: 'A very large amount of something, especially a larger amount than you need or want.',
        defUz: "Biror narsaning juda ko'p miqdori — odatda kerak yoki xohlanganidan ko\'p.",
        examples: [
          { en: 'There\'s a plethora of books about the war.',                                       uz: 'Urush haqida juda ko\'p kitoblar bor.' },
          { en: 'A plethora of options can sometimes paralyse decision-making.',                     uz: "Juda ko'p variantlar ba'zan qaror qabul qilishni qiyinlashtirishi mumkin." },
        ],
        synonyms: ['abundance', 'excess', 'surplus'],
        antonyms: ['dearth', 'scarcity'] },
    ],
    etymology: "From Greek plethōrē — 'fullness'.",
    topics: ['ielts', 'academic'],
  },

  {
    id: 'cw-unprecedented', headword: 'unprecedented', uz: "misli ko'rilmagan", cefr: 'C1',
    pron: { uk: '/ʌnˈpres.ɪ.den.tɪd/', us: '/ʌnˈpres.ə.den.t̬ɪd/' },
    senses: [
      { pos: 'adj', cefr: 'C1',
        defEn: 'Never having happened or existed before.',
        defUz: "Hech qachon yuz bermagan yoki mavjud bo\'lmagan.",
        examples: [
          { en: 'The election victory was unprecedented in scale.',                                  uz: "Saylov g'alabasi miqyosi bo\'yicha misli ko\'rilmagan edi." },
          { en: 'The pandemic created unprecedented challenges for the health system.',              uz: 'Pandemiya sog\'liqni saqlash tizimi uchun misli ko\'rilmagan qiyinchiliklar yaratdi.' },
        ],
        synonyms: ['unparalleled', 'unmatched', 'extraordinary', 'novel'],
        antonyms: ['common', 'ordinary'],
        collocations: ['unprecedented level', 'unprecedented growth', 'unprecedented crisis'] },
    ],
    wordFamily: [{ word: 'precedent', pos: 'noun' }, { word: 'precedented', pos: 'adj' }],
    topics: ['ielts', 'business', 'academic'],
  },

  {
    id: 'cw-inevitable', headword: 'inevitable', uz: 'muqarrar, oldini olib bo\'lmaydigan', cefr: 'B2',
    pron: { uk: '/ɪˈnev.ɪ.tə.bəl/', us: '/ɪˈnev.ə.t̬ə.bəl/' },
    senses: [
      { pos: 'adj', cefr: 'B2',
        defEn: 'Certain to happen and unable to be avoided or prevented.',
        defUz: 'Albatta yuz beradigan va oldini olib bo\'lmaydigan.',
        examples: [
          { en: 'A rise in interest rates seems inevitable.',                                        uz: "Foiz stavkalarining ko'tarilishi muqarrar ko\'rinadi." },
          { en: 'It was inevitable that the project would fail eventually.',                         uz: "Loyiha oxir-oqibat muvaffaqiyatsiz bo\'lishi muqarrar edi." },
        ],
        synonyms: ['unavoidable', 'inescapable', 'certain'],
        antonyms: ['avoidable', 'preventable'] },
    ],
    wordFamily: [{ word: 'inevitability', pos: 'noun' }, { word: 'inevitably', pos: 'adv' }],
    topics: ['ielts', 'academic'],
  },

  {
    id: 'cw-propensity', headword: 'propensity', uz: "moyillik, intilish", cefr: 'C2',
    pron: { uk: '/prəˈpen.sɪ.ti/', us: '/prəˈpen.sə.t̬i/' },
    senses: [
      { pos: 'noun', grammar: '[C]', cefr: 'C2', register: 'formal',
        defEn: 'A natural tendency to behave in a particular way.',
        defUz: "Ma'lum bir tarzda harakat qilishga tabiiy moyillik.",
        examples: [
          { en: 'Some people have a propensity to put on weight in middle age.',
            uz: 'Ba\'zi odamlarda o\'rta yoshda vazn ortishiga moyillik bor.' },
          { en: 'His propensity for procrastination cost him the promotion.',
            uz: 'Ishni keyinga qoldirishga moyilligi unga lavozim ko\'tarilishi imkonini bermadi.' },
        ],
        synonyms: ['tendency', 'inclination', 'predisposition', 'penchant'],
        antonyms: ['aversion', 'disinclination'],
        collocations: ['propensity for', 'propensity to (do something)'] },
    ],
    topics: ['ielts', 'academic'],
  },

  {
    id: 'cw-fastidious', headword: 'fastidious', uz: "talabchan, sinchkov", cefr: 'C2',
    pron: { uk: '/fæˈstɪd.i.əs/', us: '/fæˈstɪd.i.əs/' },
    senses: [
      { pos: 'adj', cefr: 'C2', register: 'formal',
        defEn: 'Giving too much attention to small details and wanting everything to be correct and perfect.',
        defUz: "Mayda detallarga juda ko'p e'tibor beradigan, hamma narsa to\'g\'ri va mukammal bo\'lishini xohlovchi.",
        examples: [
          { en: 'He is very fastidious about his appearance.',                                        uz: "U o'z tashqi ko'rinishiga juda talabchan." },
          { en: 'She is fastidious about cleanliness.',                                                uz: 'U tozalikka juda sinchkov.' },
        ],
        synonyms: ['meticulous', 'particular', 'finicky', 'punctilious'],
        antonyms: ['careless', 'sloppy'] },
    ],
    wordFamily: [{ word: 'fastidiously', pos: 'adv' }, { word: 'fastidiousness', pos: 'noun' }],
    topics: ['ielts', 'literary'],
  },

  {
    id: 'cw-recalcitrant', headword: 'recalcitrant', uz: "qaysar, bo'ysunmas", cefr: 'C2',
    pron: { uk: '/rɪˈkæl.sɪ.trənt/', us: '/rɪˈkæl.sə.trənt/' },
    senses: [
      { pos: 'adj', cefr: 'C2', register: 'formal',
        defEn: 'Unwilling to obey orders or to do what should be done, and difficult to control.',
        defUz: "Buyruqlarga bo'ysunishni yoki kerak bo\'lganini qilishni xohlamaydigan va boshqarish qiyin bo\'lgan.",
        examples: [
          { en: 'A class of recalcitrant teenagers.',                                                  uz: "Qaysar o'smirlar sinfi." },
          { en: 'A recalcitrant member of the team.',                                                  uz: "Jamoadagi bo'ysunmas a\'zo." },
        ],
        synonyms: ['stubborn', 'obstinate', 'intransigent', 'defiant'],
        antonyms: ['compliant', 'obedient'] },
    ],
    wordFamily: [{ word: 'recalcitrance', pos: 'noun' }],
    topics: ['ielts', 'literary'],
  },

  {
    id: 'cw-ostentatious', headword: 'ostentatious', uz: "ko'z-ko'z qiluvchi, hashamatli", cefr: 'C2',
    pron: { uk: '/ˌɒs.tenˈteɪ.ʃəs/', us: '/ˌɑː.stənˈteɪ.ʃəs/' },
    senses: [
      { pos: 'adj', cefr: 'C2', register: 'disapproving',
        defEn: 'Done in a way that is meant to attract attention or to impress people.',
        defUz: "Diqqatni jalb qilish yoki odamlarni hayratlantirish maqsadida qilingan.",
        examples: [
          { en: 'He drives an ostentatious yellow sports car.',                                        uz: "U ko'z-ko'z qiluvchi sariq sport mashinasini haydaydi." },
          { en: 'An ostentatious display of wealth.',                                                   uz: "Boylikni ko'z-ko'z qilib ko'rsatish." },
        ],
        synonyms: ['showy', 'pretentious', 'flashy', 'flamboyant'],
        antonyms: ['modest', 'unassuming'] },
    ],
    wordFamily: [{ word: 'ostentation', pos: 'noun' }, { word: 'ostentatiously', pos: 'adv' }],
    topics: ['ielts', 'literary'],
  },
];

// -----------------------------------------------------------------------------
// Search & filtering helpers
// -----------------------------------------------------------------------------

export function searchDictionary(query: string): DictEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return CAMBRIDGE_BANK;
  return CAMBRIDGE_BANK.filter(e => {
    const senses = e.senses.flatMap(s =>
      [s.defEn, s.defUz, ...(s.synonyms ?? []), ...(s.antonyms ?? []), ...(s.collocations ?? []),
       ...s.examples.flatMap(ex => [ex.en, ex.uz])]);
    const fam = (e.wordFamily ?? []).map(w => w.word);
    const idi = (e.idioms ?? []).flatMap(i => [i.phrase, i.meaningEn, i.meaningUz]);
    const haystack = [
      e.headword, e.uz, ...(e.uzAlt ?? []),
      e.pron.uk, e.pron.us, e.cefr,
      ...(e.topics ?? []),
      ...senses, ...fam, ...idi,
      e.etymology ?? '',
    ].join(' ').toLowerCase();
    return haystack.includes(q);
  });
}

export const ALL_TOPICS = Array.from(
  new Set(CAMBRIDGE_BANK.flatMap(e => e.topics ?? []))
).sort();

export const ALL_CEFR: CEFR[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
