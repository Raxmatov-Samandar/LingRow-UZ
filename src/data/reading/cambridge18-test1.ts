// =============================================================================
// Cambridge IELTS 18 — General Training, Test 1, READING
// Source: Cambridge University Press & Assessment (Cambridge IELTS 18 GT)
// Used in-app for authentic exam practice; transcribed faithfully from the book.
// =============================================================================

export type QuestionKind =
  | 'tfng'              // True / False / Not Given
  | 'paragraph_match'   // Match a statement to a paragraph A-F
  | 'note_completion'   // Fill the blank with N words from passage
  | 'table_completion'
  | 'heading_match'     // Match a heading (i-viii) to a section A-F
  | 'summary_completion'
  | 'mcq';              // Multiple choice

export interface ReadingQuestion {
  num:        number;
  kind:       QuestionKind;
  prompt:     string;            // displayed to the learner
  options?:   string[];          // for MC / heading / paragraph match
  /** Acceptable answers (case-insensitive). For TFNG: ['true']/['false']/['not given']. */
  answers:    string[];
  /** Max words allowed for fill-in answers, e.g. "ONE WORD ONLY", "NO MORE THAN TWO WORDS" */
  wordLimit?: number;
}

export interface ReadingPart {
  partNum:   number;            // 1, 2 or 3 within the section
  title:     string;            // passage title
  subtitle?: string;
  /** The passage. Either a string or paragraphs labelled A-F for matching tasks. */
  passage:   string | { label: string; title?: string; text: string }[];
  /** A short instruction block above the questions, e.g. "Read the text and answer Q1-7" */
  intro?:    string;
  questions: ReadingQuestion[];
}

export interface ReadingSection {
  num:    1 | 2 | 3;
  title:  string;
  parts:  ReadingPart[];
}

export interface ReadingTest {
  id:           string;
  source:       string;           // "Cambridge IELTS 18 — GT — Test 1"
  module:       'GT' | 'AC';
  durationMin:  number;
  sections:     ReadingSection[];
}

// -----------------------------------------------------------------------------

export const TEST: ReadingTest = {
  id: 'camb18-gt-test1',
  source: 'Cambridge IELTS 18 — General Training — Test 1',
  module: 'GT',
  durationMin: 60,
  sections: [
    // ───────────────────────────── SECTION 1 ─────────────────────────────
    {
      num: 1,
      title: 'Section 1 — Questions 1–14',
      parts: [
        {
          partNum: 1,
          title: 'What to do if your clothes have been lost or damaged by a dry cleaner',
          intro: 'Read the text below and answer Questions 1–7.',
          passage: `Dry cleaners are legally required to take reasonable care of anything left with them. You can claim compensation if your belongings are damaged or lost while in their care.

Even if the dry cleaning company has a sign saying they aren't responsible for items left with them, this isn't necessarily true. They can't opt out of this responsibility just by putting up a sign.

As soon as you realise there's a problem, contact them and explain the situation. They might offer you compensation straight away. If they don't, you should ask them to either cover the cost of repairing the item or to pay for a replacement (if it can't be repaired).

If they have to pay the cost of replacing a damaged or lost item, the maximum they're obliged to offer you is the value of the item when it was left with them, not what it would cost to replace as new. You'll probably be asked to provide evidence of how much it originally cost — for example, a receipt. The dry cleaner can then offer you a reduced amount depending on the condition of the item — you'll have to negotiate the cost with them.

If the dry cleaner is part of a national chain, you could get in touch with the customer services department of their head office and make the complaint to them directly.

If the dry cleaner refuses to compensate you or they offer you too little, try the following steps:

• If the dry cleaner is a member of a trade association such as the UK Fashion and Textile Association, you can pass your complaint to them and they may be able to help you.

• You could get an independent organisation to look at your issue and produce a report, but this could be expensive (often around £100).

If you've tried the options above and are still unhappy with the outcome, you could take your case to court. There's a time limit for going to court — from when you took the item to the dry cleaner, you have up to six years.`,
          questions: [
            {
              num: 1, kind: 'tfng',
              prompt: "Dry cleaners are generally responsible for items left with them, even if there's a sign saying the opposite.",
              answers: ['true'],
            },
            {
              num: 2, kind: 'tfng',
              prompt: "If the dry cleaner loses an item belonging to you, they should give you enough money to buy a completely new one.",
              answers: ['false'],
            },
            {
              num: 3, kind: 'tfng',
              prompt: "If you have the receipt for a damaged item, the company should refund the amount you originally paid for it.",
              answers: ['false'],
            },
            {
              num: 4, kind: 'tfng',
              prompt: "It may be possible to get support for your complaint from a dry cleaners' trade association.",
              answers: ['true'],
            },
            {
              num: 5, kind: 'tfng',
              prompt: "If you're offered too little compensation, you can request a free report from an independent organisation.",
              answers: ['false'],
            },
            {
              num: 6, kind: 'tfng',
              prompt: "Most people who take a case about a dry-cleaning company to court are satisfied with the outcome.",
              answers: ['not given'],
            },
            {
              num: 7, kind: 'tfng',
              prompt: "If an item was lost or damaged nine months ago, you can still take the dry cleaner to court.",
              answers: ['true'],
            },
          ],
        },
        {
          partNum: 2,
          title: 'Groups for readers and writers',
          intro: 'Read the text below and answer Questions 8–14.',
          passage: [
            { label: 'A', title: 'Teenvision',
              text: "This is a reading group for teens aged 12–16 which meets on the last Thursday of the month. We are a friendly group, with everybody keen to talk about what we've enjoyed reading recently and make suggestions on what we should read next. We are massive fans of action, fantasy and adventure but we try to include a mix of genres in our choices." },
            { label: 'B', title: 'Creative writing workshops',
              text: "Would you like to share your writing with others and hear their constructive suggestions for how to improve it? Have you got a book inside you but need the inspiration to get started? Build your confidence to begin formulating ideas for storylines and characters at our regular workshops. Open to all – beginners and established writers." },
            { label: 'C', title: 'Books for now',
              text: "We meet on the second and fourth Mondays of each month in members' homes. The group is open to men and women who enjoy discussing the themes and issues found in science fiction novels. Our books are usually those written from the 1960s onwards and include feminist science fiction, cyberpunk and scientific romance." },
            { label: 'D', title: "Readers' book group",
              text: "This is an open group for parents at the library, and toddlers are welcome to come along and play in the children's library while the meeting is taking place. The group reads mainly fiction of different genres. Books are supplied by the library. Anyone is welcome – have a look at our website to see what the book is for the next meeting." },
            { label: 'E', title: 'The book club',
              text: "Every month members of this group read a fabulous business book which is then discussed when we meet. At our meetings you'll have the chance to network with other members – all like-minded businesswomen – in a relaxed environment. There will be lots of ideas to discuss, as well as refreshments and lots of fun!" },
            { label: 'F', title: 'Poetry writing group',
              text: "A writing group for young poets aged between 12 and 18 at the library. You will explore how to power up your imagination, and your poems will be displayed on the library and online. The group meets fortnightly on Saturdays from 12 p.m. to 2 p.m. The group is currently full but anyone interested is welcome to join the membership waiting list." },
          ],
          questions: [
            { num:  8, kind: 'paragraph_match', prompt: 'Members of this group share ideas for the books they would like to read.', options: ['A','B','C','D','E','F'], answers: ['A'] },
            { num:  9, kind: 'paragraph_match', prompt: "It isn't possible for any new members to join this group at present.",      options: ['A','B','C','D','E','F'], answers: ['F'] },
            { num: 10, kind: 'paragraph_match', prompt: 'You can get feedback on your own work from other members of this group.',  options: ['A','B','C','D','E','F'], answers: ['B'] },
            { num: 11, kind: 'paragraph_match', prompt: 'This group focuses on stories belonging to just one genre.',                options: ['A','B','C','D','E','F'], answers: ['C'] },
            { num: 12, kind: 'paragraph_match', prompt: 'Work produced by members of this group will be available to the public.',  options: ['A','B','C','D','E','F'], answers: ['F'] },
            { num: 13, kind: 'paragraph_match', prompt: "This group doesn't read or write either poetry or fiction.",                options: ['A','B','C','D','E','F'], answers: ['E'] },
            { num: 14, kind: 'paragraph_match', prompt: 'This group would suit someone who thinks they could write a book.',         options: ['A','B','C','D','E','F'], answers: ['B'] },
          ],
        },
      ],
    },

    // ───────────────────────────── SECTION 2 ─────────────────────────────
    {
      num: 2,
      title: 'Section 2 — Questions 15–27',
      parts: [
        {
          partNum: 1,
          title: 'Mechanical lifting equipment',
          intro: 'Read the text below and answer Questions 15–22.',
          passage: `If some simple precautions are taken, lifting equipment that is essential for construction and engineering projects can be used safely. Forklift trucks, lifting trolleys, mobile and fixed cranes and all their parts are classed as lifting equipment.

All equipment used for lifting or moving heavy loads should be properly constructed. For example, equipment bearing a CE mark has been constructed to international standards. In addition, equipment that meets these standards will have documented instructions for tests that should be adhered to prior to using the equipment. Certain types of machinery, such as cranes, must be inspected by a qualified engineer on a six-monthly basis.

For operations that use cranes, a formal lift plan must be prepared. Lift plans are a type of risk assessment, whereby the possible dangers of the operation are carefully calculated, and control measures are identified and put in place. Before any lift proceeds, the plan should be talked over with the lifting crew during what is often referred to as a 'Tool Box Talk' (TBT). This is an important opportunity for them to ask questions about their role in the operation.

When heavy loads are being moved around, there are some practical things that should be done to prevent accidents. Firstly, if a load needs to be moved where workers or members of the public are present, the area must have barriers or other means to ensure no one is allowed to walk under the load while it is moving. Secondly, someone called a banksman should always be used when moving heavy loads by crane. As a crane driver often cannot see the load, especially during touch-down, this person tells him or her which way to move it.

It is very unusual for machinery such as cranes to fail. However, it is all too easy to ignore the importance of the secondary equipment. This refers to those items that are attached between the mechanical lifting machine and the load that is being lifted. Chains, slings, shackles and rigging are all examples of secondary lifting equipment, and it is perhaps surprising to note that most injuries occur due to faults or weaknesses in these items. It is essential that a six-monthly visual inspection is carried out to ensure there are no signs of wear or damage to the slings and shackles.`,
          questions: [
            { num: 15, kind: 'note_completion', wordLimit: 2,
              prompt: 'Lifting equipment must be manufactured well, e.g., have a _____ on it.',
              answers: ['ce mark', '(ce) mark'] },
            { num: 16, kind: 'note_completion', wordLimit: 2,
              prompt: 'Lifting equipment may need to undergo _____ before use.',
              answers: ['tests'] },
            { num: 17, kind: 'note_completion', wordLimit: 2,
              prompt: 'Lifting equipment may need a regular check by an _____.',
              answers: ['engineer'] },
            { num: 18, kind: 'note_completion', wordLimit: 2,
              prompt: 'Lift plans are used to establish and carry out _____ for any risks.',
              answers: ['control measures'] },
            { num: 19, kind: 'note_completion', wordLimit: 2,
              prompt: "A _____ can be consulted during a 'Tool Box Talk'.",
              answers: ['lifting crew', '(lifting) crew', 'crew'] },
            { num: 20, kind: 'note_completion', wordLimit: 2,
              prompt: "Use objects such as _____ to make sure the load doesn't pass over anyone's head.",
              answers: ['barriers'] },
            { num: 21, kind: 'note_completion', wordLimit: 2,
              prompt: 'Appoint a _____ to give verbal directions to the crane driver.',
              answers: ['banksman'] },
            { num: 22, kind: 'note_completion', wordLimit: 2,
              prompt: 'Secondary lifting equipment (chains, slings, etc.) — more likely to cause _____.',
              answers: ['injuries'] },
          ],
        },
        {
          partNum: 2,
          title: 'Dealing with customer complaints',
          intro: 'Read the text below and answer Questions 23–27.',
          passage: `When a customer complains, it is usually for a good reason. Here are some strategies that will help you handle a customer complaint in a smooth and professional manner.

When a customer presents you with a complaint, keep in mind that the issue is not personal. Aiming to win the confrontation accomplishes nothing. He or she has usually made a purchase that did not meet their expectations — a product, service, or maybe a combination of the two. A worker who remains in control of their emotions deals from a position of strength.

Let the customer say what they need to. Respond with phrases such as, 'Hmm', 'I see', and 'Tell me more'. Then be quiet. As the customer expresses their annoyance yet sees you are not reacting, he or she will begin to relax. The customer needs to do this before being able to hear your solution.

When the customer has calmed down and feels you have heard his or her side, start asking questions. Be careful not to give scripted replies but use this as an opportunity to start a genuine conversation, building a relationship of trust with your customer. To help you understand the situation, get as many details as possible.

Take charge of the situation and let the customer know what you are going to do to solve the problem. One thing to keep in mind is that you should know what you can and cannot do within the policy of the business you work for. The cost could be minimal — maybe a simple upgrade on the customer's next purchase or a small gift certificate. A simple gesture like this could result in a word-of-mouth recommendation to others, while making a promise you cannot commit to will only set you back.`,
          questions: [
            { num: 23, kind: 'table_completion', wordLimit: 1,
              prompt: 'Strategy: Stay calm — Remember it is not a direct attack on you. Do not try to _____ the argument.',
              answers: ['win'] },
            { num: 24, kind: 'table_completion', wordLimit: 1,
              prompt: 'The customer usually had _____ that were not fulfilled.',
              answers: ['expectations'] },
            { num: 25, kind: 'table_completion', wordLimit: 1,
              prompt: 'Listen well — the customer cannot recognise a _____ until calm.',
              answers: ['solution'] },
            { num: 26, kind: 'table_completion', wordLimit: 1,
              prompt: "Suggest action — be sure of your company's _____ on complaints.",
              answers: ['policy'] },
            { num: 27, kind: 'table_completion', wordLimit: 1,
              prompt: 'A satisfied customer may well make a verbal _____ in future.',
              answers: ['recommendation'] },
          ],
        },
      ],
    },

    // ───────────────────────────── SECTION 3 ─────────────────────────────
    {
      num: 3,
      title: 'Section 3 — Questions 28–40',
      parts: [
        {
          partNum: 1,
          title: 'White storks back in Britain after hundreds of years',
          subtitle: 'These beautiful birds could be about to become a feature of the British landscape again',
          intro: 'Read the text below and answer Questions 28–40. The text has six sections, A–F.',
          passage: [
            { label: 'A', text:
              "The last definitive record of a pair of white storks successfully breeding in Britain was in 1416, from a nest on St Giles Cathedral in Edinburgh. No one knows why storks disappeared from our shores. They often featured on the menus of medieval banquets so we might, quite simply, have consumed them all. But there could be a more ominous reason. Storks are migrants arriving after the end of winter, nesting on rooftops and happily associating with humans, and because of this they have long been a symbol of hope and new life. Yet their association with rebirth also meant they became a symbol of rebellion. Shortly after the restoration of King Charles II in 1660, while storks were rare but surviving, parliament debated putting greater effort into destroying them entirely for fear they might inspire republicanism. Today, fortunately, that notion has disappeared and the stork retains its association with new life, appearing on cards given to celebrate the arrival of a new child, as a bird carrying a baby in a sling held in its beak." },
            { label: 'B', text:
              "So, after such a long absence, there was great excitement when in April of this year a pair of white storks built an untidy nest of sticks in the top branches of a huge oak in the middle of our rewilding project at Knepp Estate in West Sussex. Drone footage, taken before the pair started sitting on them, showed three large eggs. The fact that they were infertile and did not hatch was not too disappointing. The pair are only four years old, and storks can live to over thirty, with their first attempts to breed often failing. Prospects for next year are encouraging. These young storks are part of a project to return the species to Britain, inspired by reintroductions in European countries that more than reached their target. Imported from Poland, they have spent the best part of three years in a six-acre pen with a group of other juveniles and several injured, non-flying adults, also from Poland. Other birds have already shown strong loyalty to the site. Two years ago, a young bird from Knepp flew across the Channel to France and, this summer, returned to its companions." },
            { label: 'C', text:
              "In the face of reports of unrelenting ecological loss (the UN estimates a million species are on the brink of extinction globally), the white stork's return is refreshing news. As tens of thousands of people demonstrate about the growing climate crisis and eco-anxiety besets us, these glimpses of restoration are important. Featuring the storks in BBC television's Springwatch in June, the ecologist Chris Packham described the project as 'imaginative, intelligent, progressive and practical'." },
            { label: 'D', text:
              "And yet its path to restoration in the UK has not been smooth. Support from conservation bodies has been surprisingly difficult to obtain; some were hard-pressed with their own initiatives, while others were simply reluctant to stick their necks out. In addition, the committee of the Sussex Wildlife Trust raised doubts about the stork now being a native British bird. They also said it might over-compete with English birds for food, or cause problems by introducing new diseases. Each of these concerns has been answered. There was also fundraising to get going on which the entire project would depend; it would cost a lot of money and need many supporters." },
            { label: 'E', text:
              "Across the world, restoration of populations of large birds — eagles, vultures and white storks — through reintroduction has become a feature of conservation in this century. White storks have already been brought back to many countries in Europe, including Sweden, Switzerland, the Netherlands, Belgium and Italy. The largest, in Sweden, started in 1989 and now has more than a hundred and fifty breeding pairs, but successful breeding only began in earnest fifteen years after the project started." },
            { label: 'F', text:
              "Last spring, two white storks were observed nesting at Knepp Estate, putting sticks together high up in a large oak tree. The female laid three eggs, which unfortunately proved to be infertile. However, this was not surprising for such young storks. Naturalists believe they are likely to breed successfully in the future. These two storks were bred in Poland and, after arriving in the UK, were kept for several years together with a few fully mature storks and some fellow juveniles before being released at Knepp. It appears that other storks are developing a sense of loyalty to their new home. One left Knepp for a year, only to fly back to be with the group again." },
          ],
          questions: [
            // Q28-33 heading match
            { num: 28, kind: 'heading_match', prompt: 'Section A',
              options: [
                'i An enterprise arising from success in other countries',
                'ii The hope that storks will inspire a range of emotions and actions',
                'iii Support from some organisations but not from others',
                'iv Finding new types of habitat',
                'v Opposition from the general public',
                'vi A sign of hope in difficult times',
                'vii Creatures which represent both joy and opposition',
                'viii Storks causing delight and the revival of public events',
              ],
              answers: ['vii', 'creatures which represent both joy and opposition'] },
            { num: 29, kind: 'heading_match', prompt: 'Section B',
              options: ['i','ii','iii','iv','v','vi','vii','viii'],
              answers: ['i'] },
            { num: 30, kind: 'heading_match', prompt: 'Section C',
              options: ['i','ii','iii','iv','v','vi','vii','viii'],
              answers: ['vi'] },
            { num: 31, kind: 'heading_match', prompt: 'Section D',
              options: ['i','ii','iii','iv','v','vi','vii','viii'],
              answers: ['iii'] },
            { num: 32, kind: 'heading_match', prompt: 'Section E',
              options: ['i','ii','iii','iv','v','vi','vii','viii'],
              answers: ['viii'] },
            { num: 33, kind: 'heading_match', prompt: 'Section F',
              options: ['i','ii','iii','iv','v','vi','vii','viii'],
              answers: ['ii'] },
            // Q34-37 summary completion
            { num: 34, kind: 'summary_completion', wordLimit: 1,
              prompt: 'Last spring, two white storks were observed nesting at Knepp Estate, putting _____ together high up in a large oak tree.',
              answers: ['sticks'] },
            { num: 35, kind: 'summary_completion', wordLimit: 1,
              prompt: 'The female laid three eggs, which unfortunately proved to be _____.',
              answers: ['infertile'] },
            { num: 36, kind: 'summary_completion', wordLimit: 1,
              prompt: 'These two storks were bred in _____ and, after arriving in the UK, were kept for several years together.',
              answers: ['poland'] },
            { num: 37, kind: 'summary_completion', wordLimit: 1,
              prompt: 'It appears that other storks are developing a sense of _____ to their new home.',
              answers: ['loyalty'] },
            // Q38-40 multiple choice
            { num: 38, kind: 'mcq',
              prompt: 'In the second paragraph (Section B), the writer says about the storks at Knepp Estate that',
              options: [
                'A — they had bred several times before this year.',
                'B — they were younger than typical breeding pairs.',
                'C — their absence from the project may be permanent.',
                'D — their failure to hatch eggs was not unexpected.',
              ],
              answers: ['D'] },
            { num: 39, kind: 'mcq',
              prompt: 'According to the writer, the response of UK conservation bodies to the project was',
              options: [
                'A — overwhelmingly enthusiastic from the start.',
                'B — supportive after they understood the goals.',
                'C — not as positive as might have been expected.',
                'D — focused mainly on the cost of the work.',
              ],
              answers: ['C'] },
            { num: 40, kind: 'mcq',
              prompt: 'What does the writer say about the Swedish reintroduction project?',
              options: [
                'A — Successful breeding only emerged after many years.',
                'B — It is the smallest among European projects.',
                'C — Its progress is only now beginning to be reported.',
                'D — It has failed to maintain a stable population.',
              ],
              answers: ['A'] },
          ],
        },
      ],
    },
  ],
};
