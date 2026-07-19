-- =============================================================================
-- Uzbek Error DNA — starter content.
--
-- This is an original, hand-written starter set (30 catalog entries + 20
-- diagnostic questions) meant to prove out the whole pipeline end-to-end.
-- It is NOT the "100-error catalog, built from real teacher/student
-- interviews" the strategy doc calls for — that still needs to happen with
-- real linguistic research. Treat this as a working skeleton to expand, not
-- the finished catalog.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- error_catalog — 6 entries per category, 30 total
-- ---------------------------------------------------------------------------
insert into error_catalog (category, wrong_example, correct_example, uzbek_root_cause, explanation, order_index) values
  ('articles', 'I saw beautiful girl.', 'I saw a beautiful girl.', 'O''zbek tilida artikl tushunchasi umuman yo''q — ot oldiga hech narsa qo''shilmaydi.', 'Ingliz tilida sanaladigan ot birlikda ishlatilganda deyarli har doim a/an yoki the kerak.', 1),
  ('articles', 'She is best student in class.', 'She is the best student in the class.', 'Superlativ va yagona narsalar bilan "the" ishlatilishi zarurligi unutiladi.', 'Eng ustun daraja (best, tallest, first) deyarli har doim "the" bilan keladi.', 2),
  ('articles', 'I want to be doctor.', 'I want to be a doctor.', 'Kasb nomlaridan oldin artikl kerakligi tushunilmaydi.', '"be/become + kasb" tuzilishida kasb nomidan oldin "a/an" majburiy.', 3),
  ('articles', 'Sun rises in east.', 'The sun rises in the east.', 'Yagona/noyob obyektlar (sun, moon, sky) va tomon nomlari bilan "the" zarurligi bilinmaydi.', 'Dunyoda bittadan bo''ladigan narsalar (sun, moon) doim "the" bilan ishlatiladi.', 4),
  ('articles', 'He plays guitar every day.', 'He plays the guitar every day.', 'Musiqa asboblari bilan "the" ishlatilishi qoidasi ona tilida yo''q.', '"Play + musiqa asbobi" tuzilishida asbob nomidan oldin "the" kerak.', 5),
  ('articles', 'I go to school by a bus.', 'I go to school by bus.', 'Aksincha xato — transport turi bilan artikl QO''YILMASLIGI kerak bo''lgan joyda giperkorreksiya sodir bo''ladi.', '"By + transport turi" ("by bus", "by car") iborasida artikl ishlatilmaydi.', 6),

  ('prepositions', 'I am interesting about music.', 'I am interested in music.', '"-ing"/"-ed" farqi va preposition tanlovi ikkalasi ham bir vaqtda chalkashadi.', '"Interested in" — biror narsaga qiziqish; "interesting" — narsaning o''zi qiziqarli ekanini bildiradi.', 7),
  ('prepositions', 'I arrived to Tashkent yesterday.', 'I arrived in Tashkent yesterday.', '"Bormoq" ma''nosidagi fe''llar bilan "to" ishlatish odati barcha joy fe''llariga ko''chiriladi.', '"Arrive in/at" qoliplashgan birikma, "to" bilan ishlatilmaydi.', 8),
  ('prepositions', 'She is married with a doctor.', 'She is married to a doctor.', 'O''zbekcha "bilan" so''zi to''g''ridan-to''g''ri "with" deb tarjima qilinadi.', '"Married to" — inglizchada qoliplashgan ibora, "with" emas.', 9),
  ('prepositions', 'I depend from my parents.', 'I depend on my parents.', 'Rus tili ta''siri ("зависеть от") orqali "from" tanlab olinadi.', '"Depend on" — inglizchada yagona to''g''ri birikma.', 10),
  ('prepositions', 'We discussed about the problem.', 'We discussed the problem.', '"About" "haqida gapirish" fe''llariga avtomatik qo''shib yuboriladi, lekin "discuss" allaqachon tranzitiv fe''l.', '"Discuss" o''ziga to''g''ridan-to''g''ri to''ldiruvchi oladi, "about" ortiqcha.', 11),
  ('prepositions', 'I''m good in mathematics.', 'I''m good at mathematics.', '"-da/-de" kelishigi to''g''ridan-to''g''ri "in" bilan tarjima qilinadi.', 'Mahorat/qobiliyat bildirishda "good at" ishlatiladi, "good in" emas.', 12),

  ('tenses', 'Yesterday I go to school.', 'Yesterday I went to school.', 'O''zbek tilida vaqt qo''shimchasi so''z bilan ifodalanadi, ingliz tilida esa fe''lning o''zi o''zgarishi kerak — o''quvchi buni unutadi.', 'Aniq o''tgan vaqt so''zi (yesterday) bo''lsa, fe''l Past Simple shaklida bo''lishi kerak.', 13),
  ('tenses', 'I am living here since 2015.', 'I have been living here since 2015.', 'O''zbek tilida "hozirgi tugallanmagan zamon" tushunchasi alohida ajratilmagan.', '"Since + sana" bilan Present Perfect Continuous ishlatiladi, oddiy Present Continuous emas.', 14),
  ('tenses', 'I have seen him yesterday.', 'I saw him yesterday.', 'Present Perfect va Past Simple farqi tushunilmagani uchun aniq o''tgan payt bilan ham Present Perfect ishlatiladi.', '"Yesterday" kabi aniq o''tgan payt so''zlari bilan faqat Past Simple ishlatiladi.', 15),
  ('tenses', 'If I will have money, I will travel.', 'If I have money, I will travel.', 'Shart ergash gapida ikkala qismda ham kelasi zamon ishlatish tabiiy tuyuladi.', 'Zero/First Conditional''da "if" qismida Present Simple, natija qismida "will" ishlatiladi.', 16),
  ('tenses', 'I am knowing the answer.', 'I know the answer.', 'Holat fe''llari (know, want, like, need) davomiy zamonda ishlatilmasligi tushunilmaydi.', 'Stative fe''llar odatda -ing shaklida ishlatilmaydi.', 17),
  ('tenses', 'She has go to Moscow last year.', 'She went to Moscow last year.', 'Present Perfect va Past Simple formalari aralashtiriladi — "has" + noto''g''ri fe''l shakli qo''shiladi.', 'Aniq o''tgan yil ko''rsatilganda Past Simple ("went") ishlatiladi, Present Perfect emas.', 18),

  ('word_order', 'Always I eat breakfast at 7.', 'I always eat breakfast at 7.', 'SOV tuzilishiga ko''ra ravishlar gap boshiga qo''yiladi, lekin ingliz tilida ular fe''ldan oldin joylashadi.', 'Chastota ravishlari (always, usually, never) asosiy fe''ldan oldin, "be" fe''lidan keyin keladi.', 19),
  ('word_order', 'I very like this song.', 'I like this song very much.', '"Juda" so''zi sifat/fe''ldan oldin to''g''ridan-to''g''ri tarjima qilib qo''yiladi.', '"Very" fe''llarni emas, sifatlarni kuchaytiradi; fe''l uchun "very much" jumla oxirida ishlatiladi.', 20),
  ('word_order', 'What you are doing?', 'What are you doing?', 'Savol gaplarida yordamchi fe''l va ega o''rinlarini almashtirish (inversiya) unutiladi.', 'Ingliz tilida savol gaplarida yordamchi fe''l egadan OLDIN keladi.', 21),
  ('word_order', 'My father car is red.', 'My father''s car is red.', 'Egalik o''zbek tilida so''z oxiriga qo''shimcha bilan ifodalanadi, ingliz tilidagi apostrof unutiladi.', 'Shaxs egaligini bildirish uchun " ''s " qo''shilishi kerak.', 22),
  ('word_order', 'Book red is on the table.', 'The red book is on the table.', 'Sifat otdan keyin kelishi mumkin bo''lgan tuzilishlar ta''sirida joylashuv aralashadi.', 'Ingliz tilida sifat har doim otdan OLDIN keladi.', 23),
  ('word_order', 'Yesterday night I didn''t sleep well.', 'Last night I didn''t sleep well.', 'Vaqt birikmalari so''zma-so''z tarjima qilinadi — "kecha kechasi" to''g''ridan-to''g''ri "yesterday night" deb yozib yuboriladi.', '"O''tgan kecha" ma''nosida inglizchada qoliplashgan ibora — "last night".', 24),

  ('vocabulary', 'I went to the magazin to buy bread.', 'I went to the shop to buy bread.', 'Rus tilidagi "магазин" so''zi ingliz "magazine" (jurnal) bilan aralashtiriladi.', '"Magazine" — jurnal; do''kon uchun "shop" yoki "store" ishlatiladi.', 25),
  ('vocabulary', 'He is very sympathetic, everyone likes him.', 'He is very likeable, everyone likes him.', '"Sympathetic" inglizchada "hamdard" ma''nosini beradi, "yoqimli" emas — bu false friend.', '"Yoqimli/kirishimli" uchun "likeable" yoki "friendly" ishlatiladi.', 26),
  ('vocabulary', 'I have a lot of informations.', 'I have a lot of information.', '"Information" sanalmaydigan ot ekanligi bilinmaydi, ko''plik qo''shimchasi qo''shib yuboriladi.', '"Information" har doim birlik shaklda, ko''plikda ishlatilmaydi.', 27),
  ('vocabulary', 'Actually, I work as a teacher every day.', 'Actually, I meant something different.', '"Actually" so''zi "hozirda" deb noto''g''ri tushuniladi, aslida "aslida/haqiqatan" ma''nosini beradi.', '"Actually" kutilganidan farqli haqiqatni bildiradi, "hozirda/hozirgi vaqtda" emas.', 28),
  ('vocabulary', 'I will control my homework before submitting.', 'I will check my homework before submitting.', '"Control" so''zi "tekshirmoq" ma''nosida ishlatiladi, lekin inglizchada "boshqarmoq/nazorat qilmoq" ma''nosini beradi.', '"Tekshirmoq" uchun "check" ishlatiladi, "control" emas.', 29),
  ('vocabulary', 'My friend is very nervous, she gets angry quickly.', 'My friend is quick-tempered, she gets angry quickly.', '"Nervous" so''zi "asabiy/tez achchiqlanadigan" ma''nosida ishlatiladi, lekin inglizchada "xavotirli" ma''nosini beradi.', '"Tez achchiqlanadigan" uchun "quick-tempered" yoki "short-tempered" ishlatiladi.', 30);

-- ---------------------------------------------------------------------------
-- diagnostic_questions — 4 per category, 20 total
-- ---------------------------------------------------------------------------
insert into diagnostic_questions (category, prompt, options, correct_index, explanation, order_index) values
  ('articles', 'Choose the correct sentence:',
    array['I saw beautiful sunset.', 'I saw a beautiful sunset.', 'I saw the beautiful sunset.', 'I saw beautiful the sunset.'],
    1, 'Sanaladigan ot birlikda bo''lsa, "a/an" kerak.', 1),
  ('articles', 'Choose the correct sentence:',
    array['She is best singer in the world.', 'She is a best singer in the world.', 'She is the best singer in the world.', 'She is best the singer in world.'],
    2, 'Superlativ daraja "the" bilan ishlatiladi.', 2),
  ('articles', 'Choose the correct sentence:',
    array['I want to become an engineer.', 'I want to become engineer.', 'I want to become the engineer.', 'I want to become a the engineer.'],
    0, 'Kasb nomidan oldin "a/an" kerak.', 3),
  ('articles', 'Choose the correct sentence:',
    array['Moon looks bright tonight.', 'A moon looks bright tonight.', 'The moon looks bright tonight.', 'Moon look bright tonight.'],
    2, 'Yagona narsalar (moon, sun) bilan "the" ishlatiladi.', 4),

  ('prepositions', 'Choose the correct sentence:',
    array['I''m interested about painting.', 'I''m interested at painting.', 'I''m interested in painting.', 'I''m interested for painting.'],
    2, '"Interested in" — qoliplashgan birikma.', 5),
  ('prepositions', 'Choose the correct sentence:',
    array['We arrived to London on Monday.', 'We arrived in London on Monday.', 'We arrived at London on Monday.', 'We arrived on London on Monday.'],
    1, 'Shahar nomlari bilan "arrive in" ishlatiladi.', 6),
  ('prepositions', 'Choose the correct sentence:',
    array['She depends from her brother.', 'She depends of her brother.', 'She depends on her brother.', 'She depends to her brother.'],
    2, '"Depend on" — yagona to''g''ri birikma.', 7),
  ('prepositions', 'Choose the correct sentence:',
    array['Let''s discuss about the plan.', 'Let''s discuss the plan.', 'Let''s discuss on the plan.', 'Let''s discuss for the plan.'],
    1, '"Discuss" o''zi tranzitiv, "about" kerak emas.', 8),

  ('tenses', 'Choose the correct sentence:',
    array['Yesterday I go to the market.', 'Yesterday I went to the market.', 'Yesterday I have gone to the market.', 'Yesterday I going to the market.'],
    1, 'Aniq o''tgan payt bilan Past Simple ishlatiladi.', 9),
  ('tenses', 'Choose the correct sentence:',
    array['I have seen that movie yesterday.', 'I saw that movie yesterday.', 'I have see that movie yesterday.', 'I was seen that movie yesterday.'],
    1, '"Yesterday" bilan Present Perfect emas, Past Simple ishlatiladi.', 10),
  ('tenses', 'Choose the correct sentence:',
    array['If I will have time, I will call you.', 'If I have time, I will call you.', 'If I had time, I will call you.', 'If I have time, I called you.'],
    1, 'First Conditional: if-qismda Present Simple.', 11),
  ('tenses', 'Choose the correct sentence:',
    array['I am knowing your brother.', 'I know your brother.', 'I am know your brother.', 'I knowing your brother.'],
    1, '"Know" stative fe''l, -ing bilan ishlatilmaydi.', 12),

  ('word_order', 'Choose the correct sentence:',
    array['Always I drink tea in the morning.', 'I always drink tea in the morning.', 'I drink always tea in the morning.', 'In the morning always I drink tea.'],
    1, 'Chastota ravishi asosiy fe''ldan oldin keladi.', 13),
  ('word_order', 'Choose the correct sentence:',
    array['I very like this book.', 'I like very this book.', 'I like this book very much.', 'Very I like this book.'],
    2, '"Very much" fe''l bilan jumla oxirida ishlatiladi.', 14),
  ('word_order', 'Choose the correct sentence:',
    array['What you are reading?', 'What reading you are?', 'What are you reading?', 'You are reading what?'],
    2, 'Savol gapida yordamchi fe''l egadan oldin keladi.', 15),
  ('word_order', 'Choose the correct sentence:',
    array['My sister car is new.', 'My sister''s car is new.', 'My sister of car is new.', 'Car of my sister is new.'],
    1, 'Egalik uchun " ''s " qo''shiladi.', 16),

  ('vocabulary', 'Which word completes: "I need to buy bread from the ___."',
    array['magazine', 'shop', 'library', 'office'],
    1, '"Magazine" — jurnal; do''kon uchun "shop" ishlatiladi.', 17),
  ('vocabulary', 'Which sentence uses "actually" correctly?',
    array['Actually, I meant something different.', 'Actually, I go to school every day at 9.', 'I will actually go there next Monday at 9am.', 'She actually lives near the school always.'],
    0, '"Actually" kutilganidan farqli haqiqatni bildiradi.', 18),
  ('vocabulary', 'Choose the correct sentence:',
    array['I have too much informations.', 'I have too many informations.', 'I have too much information.', 'I have too many information.'],
    2, '"Information" sanalmaydigan ot, ko''plikda bo''lmaydi.', 19),
  ('vocabulary', 'Which word means "to check something carefully"?',
    array['control', 'check', 'manage', 'drive'],
    1, '"Control" — boshqarmoq/nazorat qilmoq, "tekshirmoq" emas.', 20);
