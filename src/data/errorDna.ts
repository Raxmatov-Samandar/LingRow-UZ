// =============================================================================
// Uzbek Error DNA — mock-mode data.
// Mirrors supabase/migrations/0009_error_dna_seed.sql so the feature works
// identically in mock mode and against a real backend: 30 catalog entries +
// 40 diagnostic questions (8 per category). Each attempt samples 4 of the 8
// per category — see buildStratifiedQuiz() — so retakes see a different set.
// =============================================================================
import type { ErrorCatalogEntry, ErrorCategory, DiagnosticQuestion } from '@/types';

export const ERROR_CATEGORIES: ErrorCategory[] = ['articles', 'prepositions', 'tense', 'word_order', 'vocabulary'];

export const ERROR_CATEGORY_LABELS: Record<ErrorCategory, string> = {
  articles:     'Articles (a/an/the)',
  prepositions: 'Prepositions (in/on/at)',
  tense:        'Tense usage',
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

  { id: 'e13', category: 'tense',        wrongExample: 'Yesterday I go to school.',                    correctExample: 'Yesterday I went to school.',                uzbekRootCause: "Vaqt qo'shimchasi so'z bilan ifodalanadi, fe'lning o'zi o'zgarishi unutiladi." },
  { id: 'e14', category: 'tense',        wrongExample: 'I am living here since 2015.',                 correctExample: 'I have been living here since 2015.',        uzbekRootCause: "\"Hozirgi tugallanmagan zamon\" tushunchasi ona tilida alohida ajratilmagan." },
  { id: 'e15', category: 'tense',        wrongExample: 'I have seen him yesterday.',                   correctExample: 'I saw him yesterday.',                       uzbekRootCause: 'Present Perfect va Past Simple farqi tushunilmaydi.' },
  { id: 'e16', category: 'tense',        wrongExample: 'If I will have money, I will travel.',         correctExample: 'If I have money, I will travel.',            uzbekRootCause: "Shart ergash gapida ikkala qismda ham kelasi zamon tabiiy tuyuladi." },
  { id: 'e17', category: 'tense',        wrongExample: 'I am knowing the answer.',                     correctExample: 'I know the answer.',                         uzbekRootCause: 'Holat fe\'llari davomiy zamonda ishlatilmasligi tushunilmaydi.' },
  { id: 'e18', category: 'tense',        wrongExample: 'She has go to Moscow last year.',              correctExample: 'She went to Moscow last year.',              uzbekRootCause: 'Present Perfect va Past Simple formalari aralashtiriladi.' },

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
  /** Uzbek explanation, revealed to the client only after that question is answered. */
  explanation: string;
}

// Mock mode has no real users to protect an answer key from, so correctIndex
// and explanation live right on the question here (grading + reveal happen
// client-side in api.ts / the dna store).
export const DIAGNOSTIC_QUESTIONS: MockDiagnosticQuestion[] = [
  // ─────────────────────────── articles (8) ───────────────────────────
  { id: 'q1',  category: 'articles', prompt: 'Choose the correct sentence:',
    options: ['I saw beautiful sunset.', 'I saw a beautiful sunset.', 'I saw the beautiful sunset.', 'I saw beautiful the sunset.'],
    correctIndex: 1, explanation: "O'zbekchada article yo'q, shuning uchun biz 'a' ni tushirib qoldiramiz. Ingliz tilida sanaladigan ot oldida 'a' kerak: a beautiful sunset." },
  { id: 'q2',  category: 'articles', prompt: 'Choose the correct sentence:',
    options: ['She is best student in class.', 'She is a best student in class.', 'She is the best student in class.', 'She is best the student in class.'],
    correctIndex: 2, explanation: "Superlative (eng yaxshi) oldida doim 'the' keladi: the best. O'zbekchada 'eng yaxshi' oldiga hech narsa qo'ymaymiz, shuning uchun bu xato ko'p uchraydi." },
  { id: 'q3',  category: 'articles', prompt: 'Choose the correct sentence:',
    options: ['He is an university student.', 'He is a university student.', 'He is university student.', 'He is the university student.'],
    correctIndex: 1, explanation: "'University' harfi 'u' bo'lsa ham, tovushi 'yu' (undosh) bo'lib eshitiladi, shuning uchun 'a' ishlatiladi, 'an' emas. Tovushga qaraymiz, harfga emas." },
  { id: 'q4',  category: 'articles', prompt: 'Choose the correct sentence:',
    options: ['I want to be doctor.', 'I want to be a doctor.', 'I want to be the doctor.', 'I want to be doctors.'],
    correctIndex: 1, explanation: "Kasb aytilganda 'a' kerak: a doctor, a teacher, an engineer. O'zbekchada 'shifokor bo'laman' — article yo'q, shuning uchun tushirib qoldiramiz." },
  { id: 'q5',  category: 'articles', prompt: 'Choose the correct sentence:',
    options: ['Sun rises in the east.', 'A sun rises in the east.', 'The sun rises in the east.', 'Sun rises in east.'],
    correctIndex: 2, explanation: "Yagona, noyob narsalar oldida 'the' keladi: the sun, the moon, the earth. Faqat bitta quyosh bor, shuning uchun 'the'." },
  { id: 'q6',  category: 'articles', prompt: 'Choose the correct sentence:',
    options: ['I have information for you.', 'I have an information for you.', 'I have a information for you.', 'I have the informations for you.'],
    correctIndex: 0, explanation: "'Information' sanalmaydigan ot, shuning uchun 'a/an' olmaydi va ko'plikda ishlatilmaydi. Bu o'zbek o'quvchilar uchun juda qiyin qoida." },
  { id: 'q7',  category: 'articles', prompt: 'Choose the correct sentence:',
    options: ['She plays the piano very well.', 'She plays piano very well.', 'She plays a piano very well.', 'She plays pianos very well.'],
    correctIndex: 0, explanation: "Musiqa asboblari oldida 'the' keladi: play the piano, the guitar. O'zbekcha tarjimada bu his qilinmaydi, shuning uchun tushirib qoldiriladi." },
  { id: 'q8',  category: 'articles', prompt: 'Choose the correct sentence:',
    options: ['I go to school by bus.', 'I go to the school by bus.', 'I go to a school by bus.', 'I go to school by the bus.'],
    correctIndex: 0, explanation: "'Go to school', 'go to work', 'by bus' — bu turg'un iboralarda article ishlatilmaydi. Yodlab olish kerak." },

  // ─────────────────────────── prepositions (8) ───────────────────────────
  { id: 'q9',  category: 'prepositions', prompt: 'Choose the correct sentence:',
    options: ['I am interesting about history.', 'I am interested in history.', 'I am interested about history.', 'I am interesting in history.'],
    correctIndex: 1, explanation: "'Interested IN' — doim 'in' bilan keladi. Va odam 'interested' (qiziqadi), narsa 'interesting' (qiziq). O'zbekchada ikkalasi bitta so'z — 'qiziqarli'." },
  { id: 'q10', category: 'prepositions', prompt: 'Choose the correct sentence:',
    options: ['I will meet you in Monday.', 'I will meet you on Monday.', 'I will meet you at Monday.', 'I will meet you to Monday.'],
    correctIndex: 1, explanation: "Kunlar oldida 'on' keladi: on Monday, on Friday. Oylar/yillar oldida 'in', aniq vaqt oldida 'at'. Bu tizimni yodlash kerak." },
  { id: 'q11', category: 'prepositions', prompt: 'Choose the correct sentence:',
    options: ['She is good in English.', 'She is good at English.', 'She is good on English.', 'She is good with English.'],
    correctIndex: 1, explanation: "'Good AT something' — biror narsani yaxshi bilish/uddalash. O'zbekcha 'ingliz tilida yaxshi' tuzilishi 'in' ishlatishga undaydi, lekin to'g'risi 'at'." },
  { id: 'q12', category: 'prepositions', prompt: 'Choose the correct sentence:',
    options: ['I live in Tashkent at Chilonzor street.', 'I live in Tashkent on Chilonzor street.', 'I live at Tashkent in Chilonzor street.', 'I live on Tashkent at Chilonzor street.'],
    correctIndex: 1, explanation: "Shahar oldida 'in' (in Tashkent), ko'cha oldida 'on' (on Chilonzor street). Kattadan kichikka: in > on > at." },
  { id: 'q13', category: 'prepositions', prompt: 'Choose the correct sentence:',
    options: ['I depend of my parents.', 'I depend on my parents.', 'I depend from my parents.', 'I depend to my parents.'],
    correctIndex: 1, explanation: "'Depend ON' — doim 'on'. Bu ko'p tillarda 'from/of' bilan keladi, shuning uchun xato ko'p bo'ladi. Ingliz tilida faqat 'on'." },
  { id: 'q14', category: 'prepositions', prompt: 'Choose the correct sentence:',
    options: ['We arrived to the airport late.', 'We arrived at the airport late.', 'We arrived in the airport late.', 'We arrived on the airport late.'],
    correctIndex: 1, explanation: "'Arrive AT' (aniq joy) yoki 'arrive IN' (shahar/mamlakat). 'Arrive to' — umuman noto'g'ri. O'zbekcha '-ga keldik' 'to' ni undaydi." },
  { id: 'q15', category: 'prepositions', prompt: 'Choose the correct sentence:',
    options: ['I am married with a teacher.', 'I am married to a teacher.', 'I am married on a teacher.', 'I am married at a teacher.'],
    correctIndex: 1, explanation: "'Married TO someone' — doim 'to'. Ko'p tillarda 'with' ishlatiladi (kimdir bilan), lekin ingliz tilida 'to'." },
  { id: 'q16', category: 'prepositions', prompt: 'Choose the correct sentence:',
    options: ['Listen me carefully.', 'Listen to me carefully.', 'Listen at me carefully.', 'Listen for me carefully.'],
    correctIndex: 1, explanation: "'Listen TO someone' — 'to' kerak. O'zbekcha 'meni tingla' to'g'ridan-to'g'ri, shuning uchun 'to' tushirib qoldiriladi." },

  // ─────────────────────────── tense (8) ───────────────────────────
  { id: 'q17', category: 'tense', prompt: 'Choose the correct sentence:',
    options: ['Yesterday I go to the market.', 'Yesterday I went to the market.', 'Yesterday I gone to the market.', 'Yesterday I going to the market.'],
    correctIndex: 1, explanation: "'Yesterday' o'tgan zamon signal so'zi. Fe'l Past Simple bo'lishi kerak: go → went. O'zbekcha bir fe'l shakli bo'lgani uchun bu chalkashadi." },
  { id: 'q18', category: 'tense', prompt: 'Choose the correct sentence:',
    options: ['I am living here since 2010.', 'I have lived here since 2010.', 'I live here since 2010.', 'I lived here since 2010.'],
    correctIndex: 1, explanation: "'Since' bilan Present Perfect keladi (have lived) — o'tmishda boshlanib hozirgacha davom etayotgan ish. O'zbekchada bu farq yo'q." },
  { id: 'q19', category: 'tense', prompt: 'Choose the correct sentence:',
    options: ["She don't like coffee.", "She doesn't like coffee.", 'She not like coffee.', "She isn't like coffee."],
    correctIndex: 1, explanation: "3-shaxs birlik (she/he/it) uchun 'doesn't' kerak, 'don't' emas. O'zbekchada fe'l shaxsga qarab o'zgarmaydi, shuning uchun bu doim xato bo'ladi." },
  { id: 'q20', category: 'tense', prompt: 'Choose the correct sentence:',
    options: ['When I was child, I played football.', 'When I was a child, I used to play football.', 'When I was a child, I am playing football.', 'When I was child, I play football.'],
    correctIndex: 1, explanation: "O'tmishdagi takroriy odat uchun 'used to' ishlatiladi. Va 'a child' — article kerak. Ikkita qoida bir gapda." },
  { id: 'q21', category: 'tense', prompt: 'Choose the correct sentence:',
    options: ['I will call you when I will arrive.', 'I will call you when I arrive.', 'I call you when I will arrive.', 'I will call you when I arrived.'],
    correctIndex: 1, explanation: "'When' dan keyin kelasi zamonda 'will' ishlatilmaydi — Present Simple keladi (arrive). Bu o'zbek o'quvchilar uchun juda qiyin qoida." },
  { id: 'q22', category: 'tense', prompt: 'Choose the correct sentence:',
    options: ['How long you are studying English?', 'How long have you been studying English?', 'How long you study English?', 'How long you studied English?'],
    correctIndex: 1, explanation: "Davom etayotgan muddat uchun Present Perfect Continuous (have been studying). Va savol tuzilishida yordamchi fe'l oldinga chiqadi." },
  { id: 'q23', category: 'tense', prompt: 'Choose the correct sentence:',
    options: ["I didn't went to school today.", "I didn't go to school today.", "I don't went to school today.", 'I not went to school today.'],
    correctIndex: 1, explanation: "'Did' allaqachon o'tgan zamonni ko'rsatadi, shuning uchun asosiy fe'l asosiy shaklda qoladi: didn't GO, went emas. Ikki marta o'tgan zamon bo'lmaydi." },
  { id: 'q24', category: 'tense', prompt: 'Choose the correct sentence:',
    options: ['If I will have time, I will help you.', 'If I have time, I will help you.', 'If I had time, I will help you.', 'If I have time, I help you.'],
    correctIndex: 1, explanation: "First Conditional: 'if' qismida Present Simple (have), asosiy qismda 'will'. 'If' dan keyin 'will' ishlatilmaydi." },

  // ─────────────────────────── word_order (8) ───────────────────────────
  { id: 'q25', category: 'word_order', prompt: 'Choose the correct sentence:',
    options: ['Always I drink tea in the morning.', 'I always drink tea in the morning.', 'I drink always tea in the morning.', 'I drink tea always in the morning.'],
    correctIndex: 1, explanation: "Chastota ravishlari (always, usually, often) asosiy fe'ldan OLDIN keladi: I always drink. O'zbekchada 'doim' gap boshiga qo'yiladi, shuning uchun bu xato ko'p." },
  { id: 'q26', category: 'word_order', prompt: 'Choose the correct sentence:',
    options: ['I have a car red.', 'I have a red car.', 'I a red car have.', 'I red car have.'],
    correctIndex: 1, explanation: "Ingliz tilida sifat otdan OLDIN keladi: red car. O'zbekchada ham sifat oldin keladi, lekin ba'zilar 'car red' deb tarjima qiladi." },
  { id: 'q27', category: 'word_order', prompt: 'Choose the correct sentence:',
    options: ['Where you are going?', 'Where are you going?', 'Where you going?', 'Where going you are?'],
    correctIndex: 1, explanation: "Savolda yordamchi fe'l (are) subyektdan OLDIN keladi: Where ARE you going. O'zbekchada so'z tartibi o'zgarmaydi, shuning uchun bu qiyin." },
  { id: 'q28', category: 'word_order', prompt: 'Choose the correct sentence:',
    options: ['I know not the answer.', "I don't know the answer.", 'I not know the answer.', "I know don't the answer."],
    correctIndex: 1, explanation: "Inkor uchun 'don't/doesn't' + asosiy fe'l kerak: I don't know. O'zbekcha '-ma' qo'shimchasi fe'l ichida, ingliz tilida alohida so'z." },
  { id: 'q29', category: 'word_order', prompt: 'Choose the correct sentence:',
    options: ['She speaks very well English.', 'She speaks English very well.', 'She very well speaks English.', 'She English speaks very well.'],
    correctIndex: 1, explanation: "Tarz ravishi (very well) obyektdan KEYIN keladi: speaks English very well. O'zbekchada 'juda yaxshi' fe'ldan oldin turadi." },
  { id: 'q30', category: 'word_order', prompt: 'Choose the correct sentence:',
    options: ['Do you know where is the station?', 'Do you know where the station is?', 'Do you know where station is?', 'Do you know is where the station?'],
    correctIndex: 1, explanation: "Bilvosita savolda (indirect question) so'z tartibi oddiy gapdek: where the station IS. To'g'ridan-to'g'ri savoldagidek 'is the station' emas." },
  { id: 'q31', category: 'word_order', prompt: 'Choose the correct sentence:',
    options: ['I like very much this song.', 'I like this song very much.', 'I very much like this song.', 'I this song like very much.'],
    correctIndex: 1, explanation: "'Very much' gap oxiriga keladi: I like this song very much. O'zbekcha 'bu qo'shiqni juda yaxshi ko'raman' tuzilishi chalkashtiradi." },
  { id: 'q32', category: 'word_order', prompt: 'Choose the correct sentence:',
    options: ['He gave to me a book.', 'He gave me a book.', 'He gave a book to me.', 'He me gave a book.'],
    correctIndex: 1, explanation: "'Give someone something' — 'to' kerak emas: gave me a book. 'To me' bo'lsa tartib boshqacha: gave a book to me. Ikkalasi to'g'ri, lekin 'gave to me a book' xato." },

  // ─────────────────────────── vocabulary (8) ───────────────────────────
  { id: 'q33', category: 'vocabulary', prompt: 'Choose the correct word. I bought a new phone from the ___.',
    options: ['magazine', 'shop', "market's magazine", 'librarian'],
    correctIndex: 1, explanation: "'Magazin' o'zbekchada do'kon, lekin inglizcha 'magazine' — jurnal! Do'kon = shop/store. Bu klassik 'yolg'on do'st' (false friend)." },
  { id: 'q34', category: 'vocabulary', prompt: 'Choose the correct word. My father works as a ___ in a company.',
    options: ['director', 'manager', 'chef', 'artist'],
    correctIndex: 1, explanation: "Kompaniyada 'manager' (menejer). 'Chef' — oshpaz, 'director' aslida boshqaruvchi lekin kontekstga bog'liq. 'Artist' — rassom." },
  { id: 'q35', category: 'vocabulary', prompt: 'Choose the correct word. I need to ___ my English before the exam.',
    options: ['repeat', 'improve', 'translate', 'correct'],
    correctIndex: 1, explanation: "'Improve' — yaxshilash. O'zbek o'quvchilar ko'pincha 'repeat' (takrorlash) ishlatadi, lekin bu yerda 'improve' to'g'ri." },
  { id: 'q36', category: 'vocabulary', prompt: 'Choose the correct word. She is very ___ and always helps others.',
    options: ['sympathetic', 'kind', 'comfortable', 'actual'],
    correctIndex: 1, explanation: "'Kind' — mehribon. 'Sympathetic' hamdard degani, 'simpatichniy' emas. 'Comfortable' — qulay, odam haqida ishlatilmaydi. Yana false friendlar." },
  { id: 'q37', category: 'vocabulary', prompt: 'Choose the correct word. The weather is very ___ today.',
    options: ['hot', 'warm', 'boiling', 'temperature'],
    correctIndex: 1, explanation: "'Warm' — iliq (yoqimli). 'Hot' — juda issiq. Kontekstga qarab tanlanadi. 'Temperature' — harorat, sifat emas." },
  { id: 'q38', category: 'vocabulary', prompt: 'Choose the correct word. Can you ___ me how to solve this?',
    options: ['learn', 'teach', 'study', 'know'],
    correctIndex: 1, explanation: "'Teach' — o'rgatish (boshqaga). 'Learn' — o'rganish (o'zing). O'zbekcha 'o'rgatmoq/o'rganmoq' chalkashadi. Bu yerda 'teach me' to'g'ri." },
  { id: 'q39', category: 'vocabulary', prompt: 'Choose the correct word. I ___ a lot of money on books last month.',
    options: ['spent', 'spend', 'paid', 'bought'],
    correctIndex: 0, explanation: "'Spend money ON something' — pul sarflash. O'tgan zamon 'spent'. 'Pay' to'lash (aniq narsaga), 'buy' sotib olish. Kontekst 'spent' ni talab qiladi." },
  { id: 'q40', category: 'vocabulary', prompt: 'Choose the correct word. This exam was very ___, I couldn\'t answer half.',
    options: ['difficult', 'hard', 'heavy', 'strong'],
    correctIndex: 0, explanation: "'Difficult' yoki 'hard' — qiyin. 'Heavy' — og'ir (vazn), imtihon uchun ishlatilmaydi. Ikkalasi to'g'ri bo'lsa ham 'difficult' rasmiyroq va IELTS uchun yaxshiroq." },
];

/** Samples `perCategory` questions from each category (shuffled), then
 *  shuffles the overall order — so a retake doesn't repeat the same set,
 *  and categories aren't presented as a predictable block. */
export function buildStratifiedQuiz(
  pool: MockDiagnosticQuestion[] = DIAGNOSTIC_QUESTIONS,
  perCategory = 4
): MockDiagnosticQuestion[] {
  const quiz: MockDiagnosticQuestion[] = [];
  for (const category of ERROR_CATEGORIES) {
    const inCategory = pool.filter(q => q.category === category);
    if (inCategory.length < perCategory) {
      console.warn(`[errorDna] "${category}" kategoriyasida faqat ${inCategory.length} ta savol bor (${perCategory} kerak edi).`);
    }
    quiz.push(...shuffle(inCategory).slice(0, perCategory));
  }
  return shuffle(quiz);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
