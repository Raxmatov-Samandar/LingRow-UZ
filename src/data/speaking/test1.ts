// IELTS Speaking — Test 1 (generic mock; Cambridge does not publish actual
// Speaking content in advance). Format & timing match the real exam.

export interface SpeakingPart1Topic {
  topic:     string;
  questions: string[];
}

export interface SpeakingPart2 {
  cueCard:   string;          // main statement
  bullets:   string[];        // "You should say:"
  closing:   string;          // "And explain …"
  prepSec:   number;          // 60
  speakSec:  number;          // 120
}

export interface SpeakingPart3 {
  theme:     string;
  questions: string[];
}

export interface SpeakingTest {
  id:           string;
  source:       string;
  durationMin:  [number, number];        // 11..14
  part1:        SpeakingPart1Topic[];
  part2:        SpeakingPart2;
  part3:        SpeakingPart3;
}

export const SPEAKING_TEST: SpeakingTest = {
  id: 'lingrow-speaking-test1',
  source: 'LingRow Mock Speaking — Test 1',
  durationMin: [11, 14],
  part1: [
    {
      topic: 'Introduction & home',
      questions: [
        'Could you tell me your full name, please?',
        'Where are you from?',
        'Do you live in a house or an apartment? Tell me about it.',
        "What's your favourite room in your home? Why?",
      ],
    },
    {
      topic: 'Studies / work',
      questions: [
        'Are you a student or do you work?',
        'What do you enjoy most about your studies / work?',
        'Is it a popular field in your country? Why?',
        'How do you usually relax after a long day of studying / working?',
      ],
    },
    {
      topic: 'Reading habits',
      questions: [
        'Do you enjoy reading? Why / why not?',
        'What kind of books did you read as a child?',
        "Do you prefer paper books or e-books? Why?",
        'How often do you visit a library?',
      ],
    },
  ],
  part2: {
    cueCard: 'Describe a place you would like to visit.',
    bullets: [
      'where it is',
      'why you would like to go there',
      'what you would do there',
    ],
    closing: 'and explain how you feel about visiting this place.',
    prepSec:   60,
    speakSec:  120,
  },
  part3: {
    theme: 'Travel & cultural exchange',
    questions: [
      'Why do people enjoy travelling to new places?',
      'How does travelling change a person?',
      "Do you think it's important to learn about other cultures? Why?",
      'What problems can tourism cause for local communities?',
      'How do you think travel will change in the future?',
      'Should governments invest more in tourism than in other industries?',
    ],
  },
};
