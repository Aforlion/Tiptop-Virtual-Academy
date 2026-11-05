import { KeyStage } from '@/types';

export const KEY_STAGES: KeyStage[] = [
  {
    id: 'eyfs',
    name: 'Early Years (EYFS)',
    level: 'Nursery & Reception',
    ageRange: 'Ages 3 – 5',
    tagline: 'Play-based foundations, phonics, and early numeracy',
    summary: 'A nurturing, sensory-rich virtual classroom environment designed specifically for young learners with 25-minute interactive micro-sessions and hands-on offline discovery guides.',
    pricing: {
      liveMonthly: { NGN: 150000, GBP: 120, USD: 150 },
      onDemandMonthly: { NGN: 80000, GBP: 65, USD: 80 },
      fullBundleMonthly: { NGN: 220000, GBP: 175, USD: 220 },
      registrationDeposit: { NGN: 50000, GBP: 50, USD: 65 }
    },
    subjects: [
      { id: 'eyfs-phonics', name: 'Phonics & Early Literacy', category: 'core', description: 'Letters, sounds, storytelling, and speech development.', weeklyHours: 4 },
      { id: 'eyfs-maths', name: 'Early Numeracy & Shapes', category: 'core', description: 'Numbers, spatial awareness, and visual pattern recognition.', weeklyHours: 3 },
      { id: 'eyfs-world', name: 'Understanding Our World', category: 'core', description: 'Nature, community, living organisms, and science experiments.', weeklyHours: 2 },
      { id: 'eyfs-art', name: 'Creative Arts & Music', category: 'elective', description: 'Expressive rhythm, motor skills, and guided crafts.', weeklyHours: 2 },
      { id: 'eyfs-culture', name: 'African Folklore & Culture', category: 'nigerian', description: 'Indigenous tales, civic values, and community heritage.', weeklyHours: 1 }
    ]
  },
  {
    id: 'primary',
    name: 'Primary (Key Stages 1 & 2)',
    level: 'Years 1 to 6',
    ageRange: 'Ages 5 – 11',
    tagline: 'Inquiry-led British mastery with localized cultural depth',
    summary: 'Rigorous British National Curriculum covering English, Mathematics, Sciences, and Computing. Live classes are capped at 10–12 learners for personalized teacher attention.',
    pricing: {
      liveMonthly: { NGN: 250000, GBP: 180, USD: 230 },
      onDemandMonthly: { NGN: 120000, GBP: 85, USD: 110 },
      fullBundleMonthly: { NGN: 350000, GBP: 260, USD: 330 },
      registrationDeposit: { NGN: 75000, GBP: 75, USD: 95 }
    },
    subjects: [
      { id: 'pri-eng', name: 'English Language & Reading', category: 'core', description: 'Grammar, creative writing, comprehension, and vocabulary.', weeklyHours: 5 },
      { id: 'pri-maths', name: 'Mathematics Mastery', category: 'core', description: 'Singapore/British problem solving, arithmetic, and geometry.', weeklyHours: 5 },
      { id: 'pri-sci', name: 'General Science', category: 'core', description: 'Biology, chemistry concepts, physics phenomena, and lab write-ups.', weeklyHours: 4 },
      { id: 'pri-comp', name: 'Computing & Digital Literacy', category: 'core', description: 'Intro to coding, internet safety, and algorithmic thinking.', weeklyHours: 2 },
      { id: 'pri-humanities', name: 'History & Geography', category: 'elective', description: 'World civilizations, environments, and human geography.', weeklyHours: 3 },
      { id: 'pri-ng-civics', name: 'Nigerian History & Social Studies', category: 'nigerian', description: 'Local geography, constitution, historical heroes, and civic duty.', weeklyHours: 2 }
    ]
  },
  {
    id: 'lower-sec',
    name: 'Lower Secondary (Key Stage 3)',
    level: 'Years 7 to 9',
    ageRange: 'Ages 11 – 14',
    tagline: 'Bridge to advanced study and critical academic debate',
    summary: 'Developing independent academic confidence across discrete sciences, analytical literature, and modern computing in seminar-style virtual lecture rooms.',
    pricing: {
      liveMonthly: { NGN: 320000, GBP: 220, USD: 280 },
      onDemandMonthly: { NGN: 150000, GBP: 110, USD: 140 },
      fullBundleMonthly: { NGN: 450000, GBP: 320, USD: 410 },
      registrationDeposit: { NGN: 100000, GBP: 99, USD: 125 }
    },
    subjects: [
      { id: 'ks3-eng', name: 'English Literature & Language', category: 'core', description: 'Textual analysis, persuasive argumentation, and classic texts.', weeklyHours: 5 },
      { id: 'ks3-maths', name: 'Advanced Mathematics', category: 'core', description: 'Algebraic equations, trigonometry foundations, and statistics.', weeklyHours: 5 },
      { id: 'ks3-sci', name: 'Integrated Sciences (Bio, Chem, Phys)', category: 'core', description: 'Experimental design, atomic model, cellular biology, and energy.', weeklyHours: 6 },
      { id: 'ks3-cs', name: 'Computer Science & Python', category: 'elective', description: 'Python programming, data structures, and computer architecture.', weeklyHours: 3 },
      { id: 'ks3-global', name: 'Global Humanities & Economics', category: 'elective', description: 'Modern history, macro environments, and political systems.', weeklyHours: 3 },
      { id: 'ks3-ng-studies', name: 'Nigerian Social Heritage & Government', category: 'nigerian', description: 'Civic structures, contemporary African economy, and culture.', weeklyHours: 2 }
    ]
  },
  {
    id: 'upper-sec',
    name: 'Upper Secondary / IGCSE (Key Stage 4)',
    level: 'Years 10 to 11',
    ageRange: 'Ages 14 – 16',
    tagline: 'Rigorous exam preparation for Pearson Edexcel & Cambridge',
    summary: 'Two-year intensive examination track tailored to secure top A*–B marks on globally recognized International GCSE examinations, recognized by universities worldwide.',
    pricing: {
      liveMonthly: { NGN: 400000, GBP: 280, USD: 360 },
      onDemandMonthly: { NGN: 190000, GBP: 140, USD: 180 },
      fullBundleMonthly: { NGN: 580000, GBP: 410, USD: 520 },
      registrationDeposit: { NGN: 120000, GBP: 120, USD: 150 }
    },
    subjects: [
      { id: 'igcse-eng', name: 'Cambridge IGCSE English (First/Second)', category: 'core', description: 'Comprehensive examination techniques and coursework polish.', weeklyHours: 5 },
      { id: 'igcse-maths', name: 'Edexcel/Cambridge IGCSE Mathematics', category: 'core', description: 'Extended syllabus, calculus primer, vectors, and probabilities.', weeklyHours: 6 },
      { id: 'igcse-bio', name: 'IGCSE Biology (Separate/Double)', category: 'core', description: 'Genetics, physiology, ecosystems, and past-paper drills.', weeklyHours: 4 },
      { id: 'igcse-chem', name: 'IGCSE Chemistry (Separate/Double)', category: 'core', description: 'Stoichiometry, organic chemistry, electrochemistry, and mocks.', weeklyHours: 4 },
      { id: 'igcse-phys', name: 'IGCSE Physics (Separate/Double)', category: 'core', description: 'Mechanics, electromagnetism, radioactivity, and thermal physics.', weeklyHours: 4 },
      { id: 'igcse-cs', name: 'IGCSE Computer Science', category: 'elective', description: 'Algorithms, cybersecurity, binary logic, and practical coding.', weeklyHours: 4 },
      { id: 'igcse-econ', name: 'IGCSE Economics & Business', category: 'elective', description: 'Market equilibria, fiscal policies, and corporate enterprise.', weeklyHours: 3 }
    ]
  }
];

export const TRUST_METRICS = [
  { label: 'Max Class Size', value: '10–12 Students', desc: 'Guaranteed individual attention in every live room' },
  { label: 'Accreditation Readiness', value: 'Cambridge & Edexcel', desc: 'Aligned with leading British examination boards' },
  { label: 'Dual-Curriculum Option', value: 'British + Nigerian', desc: 'Preserving cultural heritage with global parity' },
  { label: 'Paystack Verified', value: '100% Secure', desc: 'Multi-currency tuition with transparent term billing' }
];

