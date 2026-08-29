# Play Console — nashr qilish ro'yxati

Holat: **2026-08-29**. Ilova `uz.lingrow.app`, versionCode 1, versionName 1.0.1.

---

## 1. Tayyor — shunchaki yuklaysiz

| Narsa | Fayl |
|---|---|
| App bundle (Play'ga yuklanadi) | `store/play/LingRow-1.0.1-release.aab` |
| APK (o'zingiz sinash uchun) | `store/play/LingRow-1.0.1-release.apk` |
| Ilova ikonkasi 512×512 | `store/play/icon-512.png` |
| Feature grafika 1024×500 | `store/play/feature-graphic-1024x500.png` |
| Telefon skrinshotlari (6 ta, 9:16) | `store/play/screenshots/` |
| Do'kon matni (UZ + EN) | `C:\Users\raxma\lingrow-android\tools\store-listing-copy.md` |

AAB `CN=LingRow, O=LingRow, L=Tashkent, C=UZ` bilan imzolangan, kalit 2054 gacha
amal qiladi. Keystore: `C:\Users\raxma\lingrow-android\lingrow-release.keystore`.
**Uni yo'qotmang** — yo'qotsangiz ilovani yangilay olmaysiz.

Maxfiylik siyosati URL (Play so'raydi):
`https://ling-row.uz/legal/privacy` — tekshirildi, 200 qaytaradi, login talab qilmaydi.

---

## 2. Siz hal qilishingiz kerak

### 2.1 Tekshiruvchilar uchun demo akkaunt — **majburiy**

Ilova login talab qiladi, ya'ni Google tekshiruvchisi ichkariga kira olmasa,
ilova rad etiladi. Play Console → **App access** → "All or some functionality is
restricted".

Shaxsiy akkauntingizni **bermang**. Alohida akkaunt oching:
- email: masalan `review@lingrow.uz` yoki oddiy Gmail
- rol: `student` (eng ko'p kontent shu rolda ko'rinadi)
- ichida bir nechta dars tugatilgan bo'lsin, shunda ekranlar bo'sh chiqmaydi

Keyin Play Console'ga login/parolni kiriting va izohga yozing:
"Sign in with the provided email and password. No SMS or phone verification is required."

### 2.2 Data Safety formasi

Ilova nima yig'ishini kodga qarab aniqladim. Formada shularni belgilang:

| Ma'lumot turi | Yig'iladimi | Bo'lishiladimi | Sababi |
|---|---|---|---|
| Ism | ha | yo'q | profil |
| Email | ha | yo'q | akkaunt |
| Telefon (ixtiyoriy) | ha | yo'q | profil |
| **Ovoz yozuvlari** | **ha** | **ha** | Speaking mashqi — OpenAI (matnga aylantirish), Anthropic (baholash) |
| Ilova faoliyati (darslar, ballar, XP) | ha | yo'q | progress |
| Yozma matnlar | ha | ha | Anthropic (baholash) |

**Ovoz haqidagi javob eng muhimi.** `supabase/functions/grade-speaking` yozuvni
Supabase Storage'ga saqlaydi, OpenAI Whisper'ga transkripsiya uchun yuboradi,
so'ng transkriptni Anthropic'ga baholashga beradi. Buni yashirsangiz va Google
aniqlasa — ilova olib tashlanadi.

Qo'shimcha savollarga:
- Shifrlangan holda uzatiladimi — **ha** (hammasi HTTPS)
- Foydalanuvchi o'chirishni so'rashi mumkinmi — **ha** (siyosatda 30 kun deb yozilgan)

### 2.3 Content rating so'rovnomasi

- Zo'ravonlik, qo'rquv, jinsiy kontent, giyohvandlik, qimor — **yo'q**
- Foydalanuvchilar bir-biri bilan muloqot qiladimi — **yo'q** (ochiq chat yo'q)
- Foydalanuvchi kontenti ommaga ko'rinadimi — **yo'q**
- Reklama — **yo'q**
- Ilova ichidagi xaridlar — **yo'q** (native'da to'lovlar yopilgan, pastga qarang)

Kutilayotgan reyting: **Everyone / 3+**.

### 2.4 Maqsadli auditoriya

**13+** ni tanlang. Maxfiylik siyosati ham shunday deydi. 13 dan kichik yosh
guruhini belgilasangiz, Families siyosati yoqiladi va tekshiruv ancha qattiqlashadi.

### 2.5 Mamlakatlar

O'zbekiston kifoya, yoki hammasi. O'zingiz tanlaysiz.

---

## 3. Bilib turishingiz kerak bo'lgan narsalar

### 3.1 Men ilovani hech qachon ishga tushirmadim

Kompyuterda Android qurilmasi ham, emulyator ham yo'q. AAB quriladi va
imzolanadi — buni tekshirdim. Lekin **ilova ochiladimi, ekranlar chiqadimi,
login ishlaydimi — sinalmagan.**

Yuklashdan oldin APK'ni telefoningizga o'rnatib, kamida shularni tekshiring:
- ochiladimi va login ishlaydimi
- Bosh sahifa, Darslar, Lug'at, Tahlil, Profil — beshalasi ham chiqadimi
- pastki tab bar ko'rinadimi va tablar almashadimi
- Speaking mashqida mikrofon ruxsati so'raladimi

### 3.2 To'lovlar native'da yopilgan — ataylab

`src/lib/platform.ts` dagi `canShowPayments()` Capacitor ichida `false`
qaytaradi. Sidebar'dagi havola ham, `/parent/billing` marshruti ham yopilgan.

Sababi: Google Play raqamli obunalar **Play Billing** orqali o'tishini talab
qiladi. Payme/Click checkout'ini ilova ichida qoldirsangiz — siyosat buzilishi.
Veb-saytda to'lovlar ishlayveradi. Ilova ichida qayta yoqish uchun avval Play
Billing ulanishi kerak.

### 3.3 Ishlamaydigan funksiyalar

Supabase'da bu kalitlar hali qo'yilmagan:
- `ESKIZ_EMAIL`, `ESKIZ_PASSWORD` → **ota-onaga kunlik SMS hisoboti ishlamaydi**
- `PAYME_MERCHANT_KEY`, `CLICK_SECRET` → to'lov webhook'lari (native'da baribir yopiq)

Ro'yxatdan o'tish **email** orqali, SMS emas — shuning uchun bu ishga
tushirishni to'smaydi, lekin ota-ona paneli qismi jim turadi.

### 3.4 Do'kon matnidagi eski URL

`store-listing-copy.md` da maxfiylik URL `lingrow-uz.vercel.app` deb turibdi.
Play Console'ga **`ling-row.uz`** ni kiriting.

### 3.5 Reklama rasmlari hali ilovadan oldinda

Siz tayyorlagan 4 ta promo rasm concept dizaynini ko'rsatadi. Bugun ularning
bir qismi haqiqiy ilovaga ko'chirildi (pastki tab bar, birlashtirilgan Tahlil,
623 so'zli lug'at), lekin Bosh sahifa va Darslar ekranlari hali eski
ko'rinishda. Skrinshot sifatida `store/play/screenshots/` dagi **haqiqiy**
rasmlarni ishlating; promo rasmlarni Bosh sahifa va Darslar ko'chirilgandan
keyin qo'ying.

---

## 4. Yuklash tartibi

1. Play Console → **Create app** → nom "LingRow", til o'zbek, ilova turi
   "App", bepul.
2. **App content** bo'limini to'liq to'ldiring (Data Safety, Content rating,
   Target audience, Privacy policy URL, App access — 2-bo'limga qarang).
3. **Production → Create new release** → `LingRow-1.0.1-release.aab` ni yuklang.
4. **Store listing** → nom, qisqa va to'liq tavsif (`store-listing-copy.md`),
   ikonka, feature grafika, skrinshotlar.
5. Mamlakatlarni tanlang → **Review release** → **Start rollout**.

Birinchi tekshiruv odatda **bir necha kundan bir haftagacha** davom etadi.
Yangi dasturchi akkauntlari uchun uzoqroq bo'lishi mumkin.
