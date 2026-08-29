# Play Store promo grafikalari — rasm generatori uchun promptlar

Bu promptlar sizning 4 ta rasmingizni takrorlaydi, lekin xatolari tuzatilgan holda.
Har birini alohida nusxalab generatorga bering.

**Avval bir ogohlantirish, aks holda vaqtingiz behuda ketadi:** sizning hozirgi
rasmlaringizdagi `mashqlai`, `etaygtgan`, `fro'yxatdan`, `20 dars/ga` — bularni siz
yozmagansiz, ularni **generator buzgan**. Rasm generatorlari uzun matnni, ayniqsa
o'zbekcha apostrofli so'zlarni, ishonchli chizmaydi. Prompt qanchalik aniq bo'lmasin,
har safar yangi joyda yangi xato chiqadi. Shuning uchun pastdagi "Ishonchli yo'l"
bo'limini ham o'qing.

---

## Hamma rasmlar uchun umumiy qoidalar

Har bir promptga shuni qo'shing:

```
STYLE (applies to the whole image):
Dark cosmic background, deep navy #0b1024, with two soft radial glows —
violet #8a4dff in the upper left, blue #2563EB in the lower right. Faint white
stars scattered across the background. Clean modern UI illustration, crisp
vector-like rendering, no photographic noise, no grain.

Accent colours: violet #8a4dff, blue #2563EB, sky blue #5aa9ff, mint green #7ef7d3.
Card surfaces: translucent dark glass, 1px light border rgba(255,255,255,0.18),
rounded corners 20px.

Typography: bold geometric sans-serif, white headlines, light grey body text
rgba(235,235,245,0.7). Uzbek Latin text with apostrophes rendered exactly as given.

Phone: modern black smartphone with a pill-shaped camera cutout at the top,
thin bezels, screen shown straight on, no perspective tilt.

MUST NOT INCLUDE:
- No "Google Play" badge, no "App Store" badge, no store buttons of any kind.
- No Apple or Google logos.
- No invented text. Render only the strings given below, character for character.
- No watermarks, no QR codes, no pricing.
```

Nima uchun nishonlar taqiqlangan: Play o'z listing grafikalarida Play nishonini
ishlatishni man qiladi, App Store nishoni esa yolg'on bo'lardi — iOS ilovasi yo'q.

---

## 1-rasm — Bosh sahifa

```
Vertical promotional graphic, 1024x1536 (2:3 portrait).

TOP LEFT: a small rounded-square violet icon tile with a white house glyph,
next to it the label text: "Bosh sahifa"

LEFT COLUMN:
Headline, three lines, large bold:
"O'qishni"
"oson va" — the word "oson" in violet #8a4dff
"qiziqarli qil!" — the word "qiziqarli" in violet #8a4dff

Sub-paragraph below it, smaller, light grey:
"Joriy progress, yangi so'zlar, ko'nikmalar va ko'proq motivatsiya — hammasi bir joyda."

Below that, four stacked feature cards. Each card: a small rounded-square coloured
icon tile on the left, a bold white title, and one line of grey text under it.

Card 1 — violet tile with a target glyph
  Title: "Maqsadingizga intiling"
  Text:  "Har kuni maqsadlaringizga yaqinlashing."
Card 2 — blue tile with an open-book glyph
  Title: "Ko'proq so'z, ko'proq bilim"
  Text:  "Yangi so'zlarni o'rganing."
Card 3 — green tile with a rising bar-chart glyph
  Title: "Tahlil qiling, rivojlaning"
  Text:  "Kuchli va zaif tomonlaringizni ko'ring."
Card 4 — orange tile with a flame glyph
  Title: "Streakni saqlang"
  Text:  "Ketma-ketlikni davom ettiring."

PHONE SCREEN (right side) — a mobile app home screen:
- Large white title "Bosh sahifa", with a small bell icon and a red badge "4"
  at the top right of the screen.
- Under it, grey line: "Salom, Aziz"
- A dark rounded search field with a magnifier icon and grey placeholder:
  "So'z qidiring"
- A wide purple gradient card (left #6D28D9 to right #A855F7), rounded 24px:
    small mint uppercase label top left: "JORIY STREAK"
    top right: a translucent white pill containing an up-arrow and "+3 kun"
    large white number "7" followed by smaller white text "kun ketma-ket"
    grey-white line under it: "Bugun 42 XP · Band 6.5 maqsad"
    a white progress bar along the bottom of the card, about 70% filled
    on the right side of this card: a friendly 3D cartoon mascot — a green and
    yellow open book character with a smiling face, big round eyes, brown arms
    and legs, one arm raised with a pointing finger; small floating 3D letters
    A, B and C in yellow and orange around it, plus a few small white sparkles
- Below the purple card, a 2x2 grid of four frosted-glass cards. Each has a small
  coloured rounded-square icon tile top left, a small green percentage pill top
  right, a mint uppercase label, and a large white number:
    green tile, "+5.2%",  label "YANGI SO'ZLAR",       number "128"
    orange tile, "+8.7%", label "BAJARILGAN DARSLAR",  number "34"
    violet tile, "+0.5",  label "IELTS BAND",          number "6.5"
    purple tile, "-0.5%" in red, label "ANIQLIK",      number "87%"
- Bottom navigation bar with five items, left to right:
    house icon + "Bosh"      <- ACTIVE: icon sits inside a glowing violet-to-blue
                                circle that floats slightly above the bar, icon white
    open book + "Darslar"
    magnifier + "Lug'at"
    bar chart + "Tahlil"
    person + "Profil"
  Inactive icons and labels are grey; the active label is sky blue.
```

---

## 2-rasm — Lug'at

Sizning rasmingizda **608** yozilgan edi — to'g'risi **609**. Bandlar soni to'g'ri edi.

```
Vertical promotional graphic, 1024x1536 (2:3 portrait).

TOP LEFT: small rounded-square violet icon tile with a white magnifier glyph,
next to it the label text: "Lug'at"

LEFT COLUMN:
Headline, three lines, large bold:
"Bilimingizni"
"kengaytiring," 
"har kuni rivojlaning!" — "har kuni" in violet #8a4dff

Sub-paragraph:
"609 ta so'z, inglizcha va o'zbekcha ma'nolari bilan. Ro'yxatlar bo'yicha oson o'rganing."

Four stacked feature cards, same treatment as before:
Card 1 — violet tile, open-book glyph
  Title: "Kundalik so'zlar"
  Text:  "Talaffuz va misol jumlalar bilan"
Card 2 — blue tile, list glyph
  Title: "Ro'yxatlar"
  Text:  "1-ro'yxatdan 10-ro'yxatgacha"
Card 3 — green tile, translation glyph
  Title: "Ikki tilda"
  Text:  "Inglizcha va o'zbekcha izoh"
Card 4 — orange tile, star glyph
  Title: "Tez qidiruv"
  Text:  "Istalgan so'zni bir zumda toping"

PHONE SCREEN — a dictionary screen:
- Large white title "Lug'at"
- Grey line under it: "609 ta so'z · inglizcha va o'zbekcha"
- A dark rounded search field, magnifier icon, grey placeholder:
  "So'z qidiring"
- Two lines of small grey helper text:
  "Ro'yxat raqami kichik bo'lsa, so'z akademik matnlarda shunchalik ko'p uchraydi."
- A vertical list of rows inside one rounded dark card. Each row: a coloured
  rounded-square tile on the left, a bold white title, a grey subtitle under it,
  a grey number on the right, and a small grey chevron pointing right:
    violet tile with a calendar glyph — "Kundalik so'zlar" / "Talaffuz va misol jumlalar bilan" / 60
    blue tile with "1"   — "1-ro'yxat" / "Akademik so'zlar" / 58
    green tile with "2"  — "2-ro'yxat" / "Akademik so'zlar" / 60
    orange tile with "3" — "3-ro'yxat" / "Akademik so'zlar" / 60
    violet tile with "4" — "4-ro'yxat" / "Akademik so'zlar" / 58
    pink tile with "5"   — "5-ro'yxat" / "Akademik so'zlar" / 54
- Bottom navigation bar, five items: "Bosh", "Darslar", "Lug'at", "Tahlil", "Profil".
  ACTIVE is "Lug'at" — the magnifier sits in a glowing violet-to-blue circle
  floating slightly above the bar, icon white, label sky blue.

Bottom left of the whole graphic: the same green-and-yellow book mascot with
floating A, B, C letters.
```

---

## 3-rasm — Darslar

Bu gorizontal format. E'tibor bering: sizning rasmingizda tepadagi yorliq
"Bosh Sahifa" edi, lekin ekranda Darslar ko'rsatilgan — yorliq mos kelmasdi.

```
Horizontal promotional graphic, 1536x1024 (3:2 landscape).

TOP LEFT: small rounded-square violet icon tile with a white open-book glyph,
next to it the label text: "Darslar"

LEFT COLUMN:
Headline, three lines, large bold:
"Bilimingizni"
"kengaytiring,"
"har kuni rivojlaning!" — "har kuni" in violet #8a4dff

Sub-paragraph:
"Speaking, Listening, Vocabulary va Reading mashqlari bilan bilimingizni oshiring."

Below it, the green-and-yellow book mascot with floating A and C letters.

CENTRE — the phone, showing a lessons screen:
- Large white title "Darslar"
- Grey line: "3 ta davom etmoqda · 1 ta tugallandi"
- A small grey uppercase row with a play triangle: "DAVOM ETTIRISH"
- A horizontal carousel of wide cards; the first is a violet gradient card,
  the second is a blue one peeking in from the right edge:
    card 1: small uppercase label "SPEAKING", white title
            "Speaking: Intervyu mashqlari", a white progress bar about 80% filled,
            and under it "80% · 20 daqiqa"
    card 2 (partly cut off): label "LISTENING", title starting "Listening:"
- A segmented control with three segments; the first is selected (light pill):
  "Hammasi" | "Davom etayotgan" | "Tugallangan"
- A vertical list of lesson rows, each with a coloured rounded-square letter tile,
  a white title, a grey subtitle, and a thin progress bar with a percentage:
    blue tile "L"   — "Listening: Cambridge Test 3" / "Listening" / 65%
    orange tile "V" — "Vocabulary: Ish joyida so'zlar" / "Vocabulary" / 40%
    violet tile "R" — "Reading: Academic matnlar" / "Reading"
- Bottom navigation bar, five items: "Bosh", "Darslar", "Lug'at", "Tahlil", "Profil".
  ACTIVE is "Darslar", in a glowing violet circle floating above the bar.

RIGHT COLUMN — four feature cards stacked vertically. Each: a round coloured icon
on the left, bold white title, two lines of grey text, and a small version of the
book mascot on the right of the card:
Card 1 — violet circle, microphone icon
  Title: "Speaking mashqlari"
  Text:  "Intervyu va suhbat mashqlari bilan erkin gapiring."
Card 2 — blue circle, headphones icon
  Title: "Listening mashqlari"
  Text:  "Audio matnlarni tinglab, tushunishni mustahkamlang."
Card 3 — orange circle, "ABC" lettering
  Title: "Vocabulary so'zlar"
  Text:  "Turli mavzulardagi so'zlarni o'rganing."
Card 4 — violet circle, open-book icon
  Title: "Reading matnlar"
  Text:  "Foydali matnlarni o'qib, darajangizni oshiring."
```

---

## 4-rasm — Tahlil

```
Horizontal promotional graphic, 1536x1024 (3:2 landscape).

TOP LEFT: small rounded-square violet icon tile with a white bar-chart glyph,
next to it the label text: "Tahlil"

LEFT COLUMN:
Headline, three lines, large bold:
"Bilimingizni"
"kengaytiring,"
"har kuni rivojlaning!" — "har kuni" in violet #8a4dff

Sub-paragraph:
"Har kuni o'qing, o'rganing va maqsadlaringizga bir qadam yaqinlashing."

Four stacked feature cards:
Card 1 — violet tile, bar-chart glyph
  Title: "Kundalik statistika"
  Text:  "XP, darslar va progress."
Card 2 — blue tile, calendar glyph
  Title: "Davom eting"
  Text:  "7 kun, 30 kun, 3 oy va yil bo'yicha tahlil."
Card 3 — green tile, rising-arrow glyph
  Title: "Rivojlaning"
  Text:  "Aniqlik va bilim o'sishini kuzatib boring."
Card 4 — orange tile, star glyph
  Title: "Maqsadga erishing"
  Text:  "Har kuni o'zingizni yaxshilang."

Below the cards: the green-and-yellow book mascot with floating A, B, C letters.

CENTRE/RIGHT — the phone, showing an analytics screen:
- Large white title "Tahlil"
- A segmented control with four segments, the first selected (violet pill):
  "7 kun" | "30 kun" | "3 oy" | "Yil"
- A dark rounded card containing a bar chart:
    top left grey label "Faollik (XP)", top right grey text "eng yuqori: 72"
    large white number "368" followed by small violet "XP"
    seven vertical rounded bars of varying heights; the last bar is a
    violet-to-blue gradient, the others are dark navy
    weekday labels under the bars, exactly: "Du" "Se" "Cho" "Pa" "Ju" "Sha" "Ya"
- A row of three small dark cards side by side, each with a grey label,
  a large white number, and a small coloured icon:
    "Darslar" / "18" / book icon
    "So'zlar" / "47" / letters icon
    "Aniqlik" / "87%" / target icon
- A wider dark card below:
    grey label "IELTS band — taxminiy baho"
    large white number "6.5"
    a small green pill on the right with an up-arrow and "+0.5"
    two lines of grey text: "Muntazam mashg'ulotlaringiz natijasida
    ko'rsatkichlaringiz yaxshilanmoqda."
- Bottom navigation bar, five items: "Bosh", "Darslar", "Lug'at", "Tahlil", "Profil".
  ACTIVE is "Tahlil", in a glowing violet circle floating above the bar.
```

---

## Ishonchli yo'l (agar generator matnni yana buzsa)

Generatordan **faqat fonni va chap ustundagi kartalarni** so'rang, telefon
ekranini bo'sh qoldiring:

```
...same style block...
Leave the phone screen completely empty — a flat dark rectangle with rounded
corners, no UI inside it. I will composite the real screenshot in myself.
```

Keyin haqiqiy skrinshotni o'sha bo'sh ekranga joylashtirish kerak. Buni menga
ayting — dasturiy yo'l bilan qo'yib beraman, matn 100% to'g'ri chiqadi va
raqamlar ilovadagi haqiqiy qiymatlarga aynan mos bo'ladi.

---

## Yodda tuting

Bu promptlar `/concept` maketidagi dizaynni tasvirlaydi. Hozircha u APK ichidagi
ilovada **yo'q** — haqiqiy ilovada pastki tab bar ham, bu Lug'at sahifasi ham
yo'q. Rasmlar to'g'ri bo'lishi uchun avval concept dizaynini haqiqiy ilovaga
ko'chirish kerak.
