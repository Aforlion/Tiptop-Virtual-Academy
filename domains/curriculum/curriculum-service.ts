// domains/curriculum/curriculum-service.ts

export interface CurriculumManifest {
  curriculumPackageId: string;
  curriculumName: string;
  version: string;
  provider: string;
  ageRange: { min: number; max: number };
  supportedAcademicLevels: string[];
  subjects: string[];
}

export interface Programme {
  name: string;
  ageRange: { min: number; max: number };
  entryRequirements: string;
  curriculumCoverage: string[];
  learningPathway: string;
  completionCriteria: string;
}

export interface LearningProgressionNode {
  previousKnowledge: string;
  currentLearning: string;
  futureLearning: string;
}

export const BRITISH_CURRICULUM_MANIFEST: CurriculumManifest = {
  curriculumPackageId: "pkg-uk-british-curriculum-v2",
  curriculumName: "National Curriculum for England (British Curriculum)",
  version: "2.0.0",
  provider: "Tiptop Academy Curriculum Development Division",
  ageRange: { min: 3, max: 18 },
  supportedAcademicLevels: [
    "Early Years Foundation Stage (EYFS)",
    "Key Stage 1 (KS1)",
    "Key Stage 2 (KS2)",
    "Key Stage 3 (KS3)",
    "Key Stage 4 (KS4 / IGCSE)",
    "Key Stage 5 (KS5 / A-Levels)"
  ],
  subjects: [
    "English Language and Literature",
    "Mathematics",
    "Sciences (Biology, Chemistry, Physics)",
    "History & Humanities",
    "Geography",
    "Computing & Information Technology",
    "Art & Creative Design"
  ]
};

export const PROGRAMMES: Record<string, Programme> = {
  eyfs: {
    name: "Early Years Foundation Stage (EYFS)",
    ageRange: { min: 3, max: 5 },
    entryRequirements: "Play-based child assessment and parent interview.",
    curriculumCoverage: ["Communication & Language", "Physical Development", "Personal/Social/Emotional", "Literacy", "Mathematics", "Understanding the World", "Expressive Arts & Design"],
    learningPathway: "Play-centric, game-based learning tasks, visual activities.",
    completionCriteria: "Observational milestone compilation by certified educators."
  },
  primary: {
    name: "Primary Years (Key Stage 1 & 2)",
    ageRange: { min: 5, max: 11 },
    entryRequirements: "Basic literacy/numeracy evaluation.",
    curriculumCoverage: ["English", "Mathematics", "Science", "Computing", "History", "Geography", "Art & Design"],
    learningPathway: "Daily live interactive sessions, cohort activities, guided homework.",
    completionCriteria: "Submission of termly portfolios, passing End of Key Stage 2 assessments."
  },
  secondary: {
    name: "Secondary Years (Key Stage 3 & 4 / IGCSE)",
    ageRange: { min: 11, max: 16 },
    entryRequirements: "Academic record review, placement testing.",
    curriculumCoverage: ["Specialized Sciences (Physics, Chemistry, Biology)", "English Literature", "Mathematics", "Computing", "Humanities"],
    learningPathway: "Lecture sessions, laboratory simulations, independent research modules.",
    completionCriteria: "Successful completion of core assignments; preparation for Cambridge IGCSE examinations."
  }
};

export const PROGRESSION_MAPS: Record<string, Record<string, LearningProgressionNode>> = {
  mathematics: {
    "year-4": {
      previousKnowledge: "Add and subtract numbers up to 4 digits.",
      currentLearning: "Add and subtract simple fractions with identical denominators.",
      futureLearning: "Calculate equivalent fractions; add fractions with different denominators."
    },
    "year-5": {
      previousKnowledge: "Add and subtract simple fractions with identical denominators.",
      currentLearning: "Calculate equivalent fractions; add fractions with different denominators.",
      futureLearning: "Multiply and divide simple fractions; simplify expressions."
    },
    "year-6": {
      previousKnowledge: "Calculate equivalent fractions; add fractions with different denominators.",
      currentLearning: "Multiply and divide simple fractions; simplify expressions.",
      futureLearning: "Associate fractions with division and calculate decimal fractions."
    }
  }
};

export class CurriculumService {
  public static getManifest(): CurriculumManifest {
    return BRITISH_CURRICULUM_MANIFEST;
  }

  public static getProgramme(key: string): Programme | undefined {
    return PROGRAMMES[key.toLowerCase()];
  }

  public static getProgression(subject: string, year: string): LearningProgressionNode | undefined {
    return PROGRESSION_MAPS[subject.toLowerCase()]?.[year.toLowerCase()];
  }

  public static calculateSiblingDiscount(baseTuition: number, siblingCount: number): number {
    if (siblingCount <= 1) return 0;
    // 10% off the base tuition for the second or third child enrolled concurrently.
    const discountableStudents = Math.min(siblingCount - 1, 2); 
    return baseTuition * 0.10 * discountableStudents;
  }

  public static getSiblingDiscountPercent(siblingCount: number): number {
    if (siblingCount <= 1) return 0;
    const discountableStudents = Math.min(siblingCount - 1, 2);
    return discountableStudents * 10;
  }

  public static calculateReferralDiscount(baseTuition: number, referralCount: number): number {
    // 5% off the tuition of the referrals child
    return baseTuition * 0.05 * referralCount;
  }
}
