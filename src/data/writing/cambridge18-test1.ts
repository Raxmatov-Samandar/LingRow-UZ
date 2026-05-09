// Cambridge IELTS 18 — General Training, Test 1, WRITING (60 minutes total)

export interface WritingTask {
  taskNum:     1 | 2;
  durationMin: number;
  minWords:    number;
  title:       string;
  prompt:      string;
  bullets?:    string[];
  /** For Task 1: starter line ("Dear …,"). For Task 2: omit. */
  starter?:    string;
  /** Notes shown to the candidate. */
  hints?:      string[];
}

export interface WritingTest {
  id:          string;
  source:      string;
  durationMin: number;
  tasks:       WritingTask[];
}

export const WRITING_TEST: WritingTest = {
  id: 'camb18-gt-test1-writing',
  source: 'Cambridge IELTS 18 — General Training — Test 1 — Writing',
  durationMin: 60,
  tasks: [
    {
      taskNum:     1,
      durationMin: 20,
      minWords:    150,
      title:       'Letter — New Year celebrations',
      prompt:
        'Your English-speaking friend has asked for your help with a college project he/she is doing about celebrating New Year in different countries.\n\n' +
        'Write a letter to your friend.',
      bullets: [
        'say how important New Year is to people in your country',
        'describe how New Year is celebrated in your country',
        'explain what you like about New Year celebrations in your country',
      ],
      starter: 'Dear ',
      hints: [
        'You do NOT need to write any addresses.',
        'Begin your letter as follows: "Dear …,"',
      ],
    },
    {
      taskNum:     2,
      durationMin: 40,
      minWords:    250,
      title:       'Essay — Working for a large vs small company',
      prompt:
        'Some people say that it is better to work for a large company than a small one.\n\n' +
        'Do you agree or disagree?',
      hints: [
        'Give reasons for your answer and include any relevant examples from your own knowledge or experience.',
      ],
    },
  ],
};
