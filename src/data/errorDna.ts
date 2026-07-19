// =============================================================================
// Uzbek Error DNA — mock-mode data.
// Mirrors supabase/migrations/0009_error_dna_seed.sql so the feature works
// identically in mock mode and against a real backend. Same disclaimer as
// the SQL file: this is a starter set to prove the pipeline, not the
// finished 100-error catalog the strategy doc calls for.
// =============================================================================
import type { ErrorCatalogEntry, ErrorCategory, DiagnosticQuestion } from '@/types';

export const ERROR_CATEGORIES: ErrorCategory[] = ['articles', 'prepositions', 'tenses', 'word_order', 'vocabulary'];

export const ERROR_CATEGORY_LABELS: Record<ErrorCategory, string> = {
  articles:     'Articles (a/an/the)',
  prepositions: 'Prepositions (in/on/at)',
  tenses:       'Tense usage',
  word_order:   'Word order',
  vocabulary:   'Vocabulary',
};

export const ERROR_CATALOG: ErrorCatalogEntry[] = [
  { id: 'e1',  category: 'articles',     wrongExample: 'I saw beautiful girl.',                       correctExample: 'I saw a beautiful girl.',                    uzbekRootCause: "O'zbek tilida artikl tushunchasi umuman yo'q — ot oldiga hech narsa qo'shilmaydi." },
  { id: 'e2',  category: 'articles',     wrongExample: 'She is best student in class.',               correctExample: 'She is the best student in the class.',      uzbekRootCause: 'Superlativ va yagona narsalar bilan "the" ishlatilishi zarurligi unutiladi.' },
  { id: 'e3',  category: 'articles',     wrongExample: 'I want to be doctor.',                         correctExample: 'I want to be a doctor.',                     uzbekRootCause: 'Kasb nomlaridan oldin artikl kerakligi tushunilmaydi.' },
  { id: 'e4',  category: 'articles',     wrongExample: 'Sun rises in east.',                           correctExample: 'The sun rises in the east.',                 uzbekRootCause: "Yagona/noyob obyektlar va tomon nomlari bilan \"the\" zarurligi bilinmaydi." },
  { id: 'e5',  category: 'articles',     wrongExample: 'He plays guitar every day.',                   correctExample: 'He plays the guitar every day.',             uzbekRootCause: "Musiqa asboblari bilan \"the\" ishlatilishi qoidasi ona tilida yo'q." },
  { id: 'e6',  category: 'articles',     wrongExample: 'I go to school by a bus.',                     correctExample: 'I go to school by bus.',                     uzbekRootCause: "Transport turi bilan artikl QO'YILMASLIGI kerak bo'lgan joyda giperkorreksiya." },

  { id: 'e7',  category: 'prepositions', wrongExample: 'I am interesting about music.',                correctExample: 'I am interested in music.',                  uzbekRootCause: '"-ing"/"-ed" farqi va preposition tanlovi bir vaqtda chalkashadi.' },
  { id: 'e8',  category: 'prepositions', wrongExample: 'I arrived to Tashkent yesterday.',             correctExample: 'I arrived in Tashkent yesterday.',           uzbekRootCause: '"Bormoq" ma\'nosidagi fe\'llar bilan "to" ishlatish odati barcha joy fe\'llariga ko\'chiriladi.' },
  { id: 'e9',  category: 'prepositions', wrongExample: 'She is married with a doctor.',                correctExample: 'She is married to a doctor.',                uzbekRootCause: "O'zbekcha \"bilan\" so'zi to'g'ridan-to'g'ri \"with\" deb tarjima qilinadi." },
  { id: 'e10', category: 'prepositions', wrongExample: 'I depend from my parents.',                    correctExample: 'I depend on my parents.',                    uzbekRootCause: 'Rus tili ta\'siri ("зависеть от") orqali "from" tanlab olinadi.' },
  { id: 'e11', category: 'prepositions', wrongExample: 'We discussed about the problem.',               correctExample: 'We discussed the problem.',                  uzbekRootCause: '"About" gapirish fe\'llariga avtomatik qo\'shib yuboriladi, "discuss" allaqachon tranzitiv.' },
  { id: 'e12', category: 'prepositions', wrongExample: "I'm good in mathematics.",                     correctExample: "I'm good at mathematics.",                  uzbekRootCause: '"-da/-de" kelishigi to\'g\'ridan-to\'g\'ri "in" bilan tarjima qilinadi.' },

  { id: 'e13', category: 'tenses',       wrongExample: 'Yesterday I go to school.',                    correctExample: 'Yesterday I went to school.',                uzbekRootCause: "Vaqt qo'shimchasi so'z bilan ifodalanadi, fe'lning o'zi o'zgarishi unutiladi." },
  { id: 'e14', category: 'tenses',       wrongExample: 'I am living here since 2015.',                 correctExample: 'I have been living here since 2015.',        uzbekRootCause: "\"Hozirgi tugallanmagan zamon\" tushunchasi ona tilida alohida ajratilmagan." },
  { id: 'e15', category: 'tenses',       wrongExample: 'I have seen him yesterday.',                   correctExample: 'I saw him yesterday.',                       uzbekRootCause: 'Present Perfect va Past Simple farqi tushunilmaydi.' },
  { id: 'e16', category: 'tenses',       wrongExample: 'If I will have money, I will travel.',         correctExample: 'If I have money, I will travel.',            uzbekRootCause: "Shart ergash gapida ikkala qismda ham kelasi zamon tabiiy tuyuladi." },
  { id: 'e17', category: 'tenses',       wrongExample: 'I am knowing the answer.',                     correctExample: 'I know the answer.',                         uzbekRootCause: 'Holat fe\'llari davomiy zamonda ishlatilmasligi tushunilmaydi.' },
  { id: 'e18', category: 'tenses',       wrongExample: 'She has go to Moscow last year.',              correctExample: 'She went to Moscow last year.',              uzbekRootCause: 'Present Perfect va Past Simple formalari aralashtiriladi.' },

  { id: 'e19', category: 'word_order',   wrongExample: 'Always I eat breakfast at 7.',                 correctExample: 'I always eat breakfast at 7.',               uzbekRootCause: 'SOV odatiga ko\'ra ravishlar gap boshiga qo\'yiladi.' },
  { id: 'e20', category: 'word_order',   wrongExample: 'I very like this song.',                       correctExample: 'I like this song very much.',                uzbekRootCause: '"Juda" so\'zi fe\'ldan oldin to\'g\'ridan-to\'g\'ri tarjima qilinadi.' },
  { id: 'e21', category: 'word_order',   wrongExample: 'What you are doing?',                          correctExample: 'What are you doing?',                        uzbekRootCause: "Savol gaplarida yordamchi fe'l-ega inversiyasi unutiladi." },
  { id: 'e22', category: 'word_order',   wrongExample: 'My father car is red.',                        correctExample: "My father's car is red.",                    uzbekRootCause: "Egalik ona tilida so'z oxiriga qo'shimcha bilan ifodalanadi." },
  { id: 'e23', category: 'word_order',   wrongExample: 'Book red is on the table.',                    correctExample: 'The red book is on the table.',              uzbekRootCause: 'Sifat otdan keyin kelishi mumkin bo\'lgan tuzilishlar ta\'sirida joylashuv aralashadi.' },
  { id: 'e24', category: 'word_order',   wrongExample: "Yesterday night I didn't sleep well.",         correctExample: "Last night I didn't sleep well.",            uzbekRootCause: "Vaqt birikmalari so'zma-so'z tarjima qilinadi." },

  { id: 'e25', category: 'vocabulary',   wrongExample: 'I went to the magazin to buy bread.',          correctExample: 'I went to the shop to buy bread.',           uzbekRootCause: '"Магазин" so\'zi ingliz "magazine" (jurnal) bilan aralashtiriladi.' },
  { id: 'e26', category: 'vocabulary',   wrongExample: 'He is very sympathetic, everyone likes him.',  correctExample: 'He is very likeable, everyone likes him.',   uzbekRootCause: '"Sympathetic" — "hamdard", "yoqimli" emas (false friend).' },
  { id: 'e27', category: 'vocabulary',   wrongExample: 'I have a lot of informations.',                correctExample: 'I have a lot of information.',               uzbekRootCause: '"Information" sanalmaydigan ot, ko\'plik qo\'shimchasi qo\'shib yuboriladi.' },
  { id: 'e28', category: 'vocabulary',   wrongExample: 'Actually, I work as a teacher every day.',     correctExample: 'Actually, I meant something different.',     uzbekRootCause: '"Actually" "hozirda" deb noto\'g\'ri tushuniladi.' },
  { id: 'e29', category: 'vocabulary',   wrongExample: 'I will control my homework before submitting.',correctExample: 'I will check my homework before submitting.',uzbekRootCause: '"Control" — "boshqarmoq", "tekshirmoq" emas.' },
  { id: 'e30', category: 'vocabulary',   wrongExample: 'My friend is very nervous, she gets angry quickly.', correctExample: 'My friend is quick-tempered, she gets angry quickly.', uzbekRootCause: '"Nervous" — "xavotirli", "tez achchiqlanadigan" emas.' },
];

export interface MockDiagnosticQuestion extends DiagnosticQuestion {
  correctIndex: number;
}

// Mock mode has no real users to protect an answer key from, so correctIndex
// lives right on the question here (grading happens client-side in dna.ts store).
export const DIAGNOSTIC_QUESTIONS: MockDiagnosticQuestion[] = [
  { id: 'q1',  category: 'articles',     prompt: 'Choose the correct sentence:', options: ['I saw beautiful sunset.', 'I saw a beautiful sunset.', 'I saw the beautiful sunset.', 'I saw beautiful the sunset.'], correctIndex: 1 },
  { id: 'q2',  category: 'articles',     prompt: 'Choose the correct sentence:', options: ['She is best singer in the world.', 'She is a best singer in the world.', 'She is the best singer in the world.', 'She is best the singer in world.'], correctIndex: 2 },
  { id: 'q3',  category: 'articles',     prompt: 'Choose the correct sentence:', options: ['I want to become an engineer.', 'I want to become engineer.', 'I want to become the engineer.', 'I want to become a the engineer.'], correctIndex: 0 },
  { id: 'q4',  category: 'articles',     prompt: 'Choose the correct sentence:', options: ['Moon looks bright tonight.', 'A moon looks bright tonight.', 'The moon looks bright tonight.', 'Moon look bright tonight.'], correctIndex: 2 },

  { id: 'q5',  category: 'prepositions', prompt: 'Choose the correct sentence:', options: ["I'm interested about painting.", "I'm interested at painting.", "I'm interested in painting.", "I'm interested for painting."], correctIndex: 2 },
  { id: 'q6',  category: 'prepositions', prompt: 'Choose the correct sentence:', options: ['We arrived to London on Monday.', 'We arrived in London on Monday.', 'We arrived at London on Monday.', 'We arrived on London on Monday.'], correctIndex: 1 },
  { id: 'q7',  category: 'prepositions', prompt: 'Choose the correct sentence:', options: ['She depends from her brother.', 'She depends of her brother.', 'She depends on her brother.', 'She depends to her brother.'], correctIndex: 2 },
  { id: 'q8',  category: 'prepositions', prompt: 'Choose the correct sentence:', options: ["Let's discuss about the plan.", "Let's discuss the plan.", "Let's discuss on the plan.", "Let's discuss for the plan."], correctIndex: 1 },

  { id: 'q9',  category: 'tenses',       prompt: 'Choose the correct sentence:', options: ['Yesterday I go to the market.', 'Yesterday I went to the market.', 'Yesterday I have gone to the market.', 'Yesterday I going to the market.'], correctIndex: 1 },
  { id: 'q10', category: 'tenses',       prompt: 'Choose the correct sentence:', options: ['I have seen that movie yesterday.', 'I saw that movie yesterday.', 'I have see that movie yesterday.', 'I was seen that movie yesterday.'], correctIndex: 1 },
  { id: 'q11', category: 'tenses',       prompt: 'Choose the correct sentence:', options: ['If I will have time, I will call you.', 'If I have time, I will call you.', 'If I had time, I will call you.', 'If I have time, I called you.'], correctIndex: 1 },
  { id: 'q12', category: 'tenses',       prompt: 'Choose the correct sentence:', options: ['I am knowing your brother.', 'I know your brother.', 'I am know your brother.', 'I knowing your brother.'], correctIndex: 1 },

  { id: 'q13', category: 'word_order',   prompt: 'Choose the correct sentence:', options: ['Always I drink tea in the morning.', 'I always drink tea in the morning.', 'I drink always tea in the morning.', 'In the morning always I drink tea.'], correctIndex: 1 },
  { id: 'q14', category: 'word_order',   prompt: 'Choose the correct sentence:', options: ['I very like this book.', 'I like very this book.', 'I like this book very much.', 'Very I like this book.'], correctIndex: 2 },
  { id: 'q15', category: 'word_order',   prompt: 'Choose the correct sentence:', options: ['What you are reading?', 'What reading you are?', 'What are you reading?', 'You are reading what?'], correctIndex: 2 },
  { id: 'q16', category: 'word_order',   prompt: 'Choose the correct sentence:', options: ['My sister car is new.', "My sister's car is new.", 'My sister of car is new.', 'Car of my sister is new.'], correctIndex: 1 },

  { id: 'q17', category: 'vocabulary',   prompt: 'Which word completes: "I need to buy bread from the ___."', options: ['magazine', 'shop', 'library', 'office'], correctIndex: 1 },
  { id: 'q18', category: 'vocabulary',   prompt: 'Which sentence uses "actually" correctly?', options: ['Actually, I meant something different.', 'Actually, I go to school every day at 9.', 'I will actually go there next Monday at 9am.', 'She actually lives near the school always.'], correctIndex: 0 },
  { id: 'q19', category: 'vocabulary',   prompt: 'Choose the correct sentence:', options: ['I have too much informations.', 'I have too many informations.', 'I have too much information.', 'I have too many information.'], correctIndex: 2 },
  { id: 'q20', category: 'vocabulary',   prompt: 'Which word means "to check something carefully"?', options: ['control', 'check', 'manage', 'drive'], correctIndex: 1 },
];
