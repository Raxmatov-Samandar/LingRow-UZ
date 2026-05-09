// Cambridge IELTS 18 — General Training, Test 1, LISTENING (40 questions, ~30 min)
// Source: Cambridge University Press & Assessment (Cambridge IELTS 18 GT)

export type ListeningKind =
  | 'fill_in'           // single-answer text/number
  | 'mcq'               // pick A/B/C
  | 'pick_two'          // pick two from A-E
  | 'matching';         // match question N to letter A-G

export interface ListeningQuestion {
  num:        number;
  kind:       ListeningKind;
  prompt:     string;
  options?:   string[];
  /** All accepted answers (case-insensitive). Multi-answer items separate with commas. */
  answers:    string[];
  wordLimit?: number;
}

export interface ListeningPart {
  partNum:    1 | 2 | 3 | 4;
  title:      string;
  scenario?:  string;
  /** Optional MP3 path under /public/audio/, e.g. "audio/c18-t1-p1.mp3" */
  audioSrc?:  string;
  /** A header that appears above the questions (e.g. "Transport survey") */
  groupTitle?: string;
  intro?:     string;
  questions:  ListeningQuestion[];
}

export interface ListeningTest {
  id:           string;
  source:       string;
  durationMin:  number;
  parts:        ListeningPart[];
}

// -----------------------------------------------------------------------------

export const LIST_TEST: ListeningTest = {
  id: 'camb18-gt-test1-listening',
  source: 'Cambridge IELTS 18 — General Training — Test 1 — Listening',
  durationMin: 30,
  parts: [
    // ───────────────────────────── PART 1 ─────────────────────────────
    {
      partNum: 1,
      title: 'Part 1 — Questions 1–10',
      scenario: 'A woman is taking part in a transport survey.',
      audioSrc: 'audio/c18-t1-p1.mp3',
      groupTitle: 'Transport survey',
      intro: 'Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.',
      questions: [
        { num: 1, kind: 'fill_in', wordLimit: 2, prompt: 'Postcode',                         answers: ['dw30 7yz'] },
        { num: 2, kind: 'fill_in', wordLimit: 2, prompt: 'Date of bus journey',              answers: ['24th april', '24 april'] },
        { num: 3, kind: 'fill_in', wordLimit: 1, prompt: 'Reason for trip — shopping and visit to the …', answers: ['dentist'] },
        { num: 4, kind: 'fill_in', wordLimit: 1, prompt: 'Travelled by bus because cost of … too high',   answers: ['parking'] },
        { num: 5, kind: 'fill_in', wordLimit: 1, prompt: 'Got on bus at … Street',           answers: ['claxby'] },
        { num: 6, kind: 'fill_in', wordLimit: 1, prompt: 'Complaints about bus service: bus today was …', answers: ['late'] },
        { num: 7, kind: 'fill_in', wordLimit: 1, prompt: 'Frequency of buses in the …',      answers: ['evening'] },
        { num: 8, kind: 'fill_in', wordLimit: 1, prompt: 'Travelling by car — Goes to the … by car',     answers: ['supermarket'] },
        { num: 9, kind: 'fill_in', wordLimit: 1, prompt: 'Dislikes travelling by bike in the city centre because of …', answers: ['pollution'] },
        { num: 10, kind: 'fill_in', wordLimit: 1, prompt: "Doesn't own a bike because of a lack of …",   answers: ['storage'] },
      ],
    },
    // ───────────────────────────── PART 2 ─────────────────────────────
    {
      partNum: 2,
      title: 'Part 2 — Questions 11–20',
      scenario: 'A talk to potential volunteers about a community charity.',
      audioSrc: 'audio/c18-t1-p2.mp3',
      groupTitle: 'Becoming a volunteer for ACE',
      intro: 'Choose the correct letter, A, B or C (Q 11–13). Choose TWO letters A–E (Q 14–15). Then match boxes (Q 16–20).',
      questions: [
        { num: 11, kind: 'mcq', prompt: 'Why does the speaker apologise about the seats?',
          options: ['A — They are too small.','B — There are not enough of them.','C — Some of them are very close together.'],
          answers: ['C'] },
        { num: 12, kind: 'mcq', prompt: 'What does the speaker say about the age of volunteers?',
          options: ['A — The age of volunteers is less important than other factors.','B — Young volunteers are less reliable than older ones.','C — Most volunteers are about 60 years old.'],
          answers: ['A'] },
        { num: 13, kind: 'mcq', prompt: 'What does the speaker say about training?',
          options: ['A — It is continuous.','B — It is conducted by a manager.','C — It takes place online.'],
          answers: ['A'] },
        { num: 14, kind: 'pick_two', prompt: 'Which TWO issues does the speaker ask the audience to consider before they apply to be volunteers? (pick two)',
          options: ['A — their financial situation','B — their level of commitment','C — their work experience','D — their ambition','E — their availability'],
          answers: ['B', 'E'] },
        { num: 15, kind: 'pick_two', prompt: '(second answer to Q 14)',
          options: ['A — their financial situation','B — their level of commitment','C — their work experience','D — their ambition','E — their availability'],
          answers: ['B', 'E'] },

        // Q16-20 matching: helpful things volunteers might offer (A-G)
        { num: 16, kind: 'matching', prompt: 'Fundraising',         options: ['A — experience on stage','B — original, new ideas','C — parenting skills','D — an understanding of food and diet','E — retail experience','F — a good memory','G — a good level of fitness'], answers: ['B'] },
        { num: 17, kind: 'matching', prompt: 'Litter collection',   options: ['A','B','C','D','E','F','G'], answers: ['G'] },
        { num: 18, kind: 'matching', prompt: "'Playmates'",         options: ['A','B','C','D','E','F','G'], answers: ['C'] },
        { num: 19, kind: 'matching', prompt: 'Story club',          options: ['A','B','C','D','E','F','G'], answers: ['A'] },
        { num: 20, kind: 'matching', prompt: 'First aid',           options: ['A','B','C','D','E','F','G'], answers: ['F'] },
      ],
    },
    // ───────────────────────────── PART 3 ─────────────────────────────
    {
      partNum: 3,
      title: 'Part 3 — Questions 21–30',
      scenario: 'Two students, Hugo and Chantal, discuss a talk on jobs in fashion design.',
      audioSrc: 'audio/c18-t1-p3.mp3',
      groupTitle: 'Talk on jobs in fashion design',
      intro: 'Choose the correct letter, A, B or C.',
      questions: [
        { num: 21, kind: 'mcq', prompt: 'What problem did Chantal have at the start of the talk?',
          options: ['A — Her view of the speaker was blocked.','B — She was unable to find an empty seat.','C — The students next to her were talking.'],
          answers: ['A'] },
        { num: 22, kind: 'mcq', prompt: 'What were Hugo and Chantal surprised to hear about the job market?',
          options: ['A — It has become more competitive than it used to be.','B — There is more variety in it than they had realised.','C — Some areas of it are more exciting than others.'],
          answers: ['C'] },
        { num: 23, kind: 'mcq', prompt: "Hugo and Chantal agree that the speaker's message was",
          options: ['A — unfair to them at times.','B — hard for them to follow.','C — critical of the industry.'],
          answers: ['A'] },
        { num: 24, kind: 'mcq', prompt: 'What do Hugo and Chantal criticise about their school careers advice?',
          options: ['A — when they received the advice','B — how much advice was given','C — who gave the advice'],
          answers: ['C'] },
        { num: 25, kind: 'mcq', prompt: 'When discussing their future, Hugo and Chantal disagree on',
          options: ['A — which is the best career in fashion.','B — when to choose a career in fashion.','C — why they would like a career in fashion.'],
          answers: ['C'] },
        { num: 26, kind: 'mcq', prompt: 'How does Hugo feel about being an unpaid assistant?',
          options: ['A — He is realistic about the practice.','B — He feels the practice is dishonest.','C — He thinks others want to change the practice.'],
          answers: ['A'] },
        { num: 27, kind: 'pick_two', prompt: 'Which TWO mistakes did the speaker admit she made in her first job?',
          options: ['A — being dishonest to her employer','B — paying too much attention to how she looked','C — expecting to become well known','D — trying to earn a lot of money','E — openly disliking her client'],
          answers: ['B', 'C'] },
        { num: 28, kind: 'pick_two', prompt: '(second answer to Q 27)',
          options: ['A','B','C','D','E'],
          answers: ['B', 'C'] },
        { num: 29, kind: 'pick_two', prompt: 'Which TWO pieces of retail information do Hugo and Chantal agree would be useful?',
          options: ['A — the reasons people return fashion items','B — how much time people have to shop for clothes','C — fashion designs people want but can\'t find','D — the best time of year for fashion buying','E — the most popular fashion sizes'],
          answers: ['A', 'C'] },
        { num: 30, kind: 'pick_two', prompt: '(second answer to Q 29)',
          options: ['A','B','C','D','E'],
          answers: ['A', 'C'] },
      ],
    },
    // ───────────────────────────── PART 4 ─────────────────────────────
    {
      partNum: 4,
      title: 'Part 4 — Questions 31–40',
      scenario: 'A lecture about elephant translocation.',
      audioSrc: 'audio/c18-t1-p4.mp3',
      groupTitle: 'Elephant translocation',
      intro: 'Complete the notes below. Write ONE WORD ONLY for each answer.',
      questions: [
        { num: 31, kind: 'fill_in', wordLimit: 1, prompt: 'Problems caused by elephant overpopulation: damage to … in the park', answers: ['fences'] },
        { num: 32, kind: 'fill_in', wordLimit: 1, prompt: 'A suitable group of elephants from the same … was selected.',         answers: ['fight'] },
        { num: 33, kind: 'fill_in', wordLimit: 1, prompt: 'Vets and park staff used … to help guide the elephants into an open plain.', answers: ['helicopters'] },
        { num: 34, kind: 'fill_in', wordLimit: 1, prompt: 'This process had to be completed quickly to reduce …',                 answers: ['stress'] },
        { num: 35, kind: 'fill_in', wordLimit: 1, prompt: 'Elephants had to be turned on their … to avoid damage to their lungs.', answers: ['sides'] },
        { num: 36, kind: 'fill_in', wordLimit: 1, prompt: "Elephants' … had to be monitored constantly.",                          answers: ['breathing'] },
        { num: 37, kind: 'fill_in', wordLimit: 1, prompt: 'Data including the size of their tusks and … was taken.',               answers: ['feet'] },
        { num: 38, kind: 'fill_in', wordLimit: 1, prompt: 'Advantages of translocation: … opportunities',                          answers: ['employment'] },
        { num: 39, kind: 'fill_in', wordLimit: 1, prompt: 'Reduction in the number of poachers and …',                             answers: ['weapons'] },
        { num: 40, kind: 'fill_in', wordLimit: 1, prompt: 'Increase in … as a contributor to GDP',                                 answers: ['tourism'] },
      ],
    },
  ],
};
