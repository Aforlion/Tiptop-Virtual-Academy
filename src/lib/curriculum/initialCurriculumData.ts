import fs from 'fs';
import path from 'path';

export interface CurriculumTopicRaw {
  year_group: string;
  subject: string;
  term: number;
  topic_title: string;
  learning_objectives: string[];
}

/**
 * Normalized British Curriculum initial database seed data parsed from research documents
 */
export const INITIAL_CURRICULUM_DATA: CurriculumTopicRaw[] = [
  {
    year_group: 'Year 1',
    subject: 'English Language & Literacy',
    term: 1,
    topic_title: 'Phonics & Early Reading Skills',
    learning_objectives: [
      'Identify phase 2 and 3 grapheme-phoneme correspondences',
      'Blend sounds to read simple CVC words fluently',
      'Recognize common tricky words (the, to, go, no)'
    ]
  },
  {
    year_group: 'Year 1',
    subject: 'Mathematics & Numeracy',
    term: 1,
    topic_title: 'Number & Place Value to 20',
    learning_objectives: [
      'Count reliably to 20 forwards and backwards',
      'Read and write numbers from 1 to 20 in numerals',
      'Identify one more and one less than a given number'
    ]
  },
  {
    year_group: 'Year 2',
    subject: 'Science & Scientific Enquiry',
    term: 1,
    topic_title: 'Living Things & Their Habitats',
    learning_objectives: [
      'Explore and compare differences between living, dead, and non-living things',
      'Identify that most living things live in habitats suited to them',
      'Describe how animals obtain food from other animals and plants'
    ]
  },
  {
    year_group: 'Year 3',
    subject: 'Mathematics & Numeracy',
    term: 2,
    topic_title: 'Fractions & Division Relations',
    learning_objectives: [
      'Count up and down in tenths',
      'Recognize, find, and write fractions of a discrete set of objects',
      'Compare and order unit fractions and fractions with the same denominators'
    ]
  },
  {
    year_group: 'Year 4',
    subject: 'Computing & Digital Skills',
    term: 2,
    topic_title: 'Algorithms & Block Programming',
    learning_objectives: [
      'Design, write, and debug programs that accomplish specific goals',
      'Use sequence, selection, and repetition in programs',
      'Work with variables and various forms of input and output'
    ]
  }
];
