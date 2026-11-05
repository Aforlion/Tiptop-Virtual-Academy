export type KeyStageId = 'eyfs' | 'primary' | 'lower-sec' | 'upper-sec';

export type DeliveryFormat = 'live' | 'on-demand' | 'bundle';

export type Currency = 'NGN' | 'GBP' | 'USD';

export interface SubjectItem {
  id: string;
  name: string;
  category: 'core' | 'elective' | 'nigerian';
  description: string;
  weeklyHours: number;
}

export interface KeyStage {
  id: KeyStageId;
  name: string;
  level: string;
  ageRange: string;
  tagline: string;
  summary: string;
  subjects: SubjectItem[];
  pricing: {
    liveMonthly: Record<Currency, number>;
    onDemandMonthly: Record<Currency, number>;
    fullBundleMonthly: Record<Currency, number>;
    registrationDeposit: Record<Currency, number>;
  };
}

export interface TuitionQuote {
  keyStageId: KeyStageId;
  format: DeliveryFormat;
  selectedSubjectIds: string[];
  currency: Currency;
  hasSiblingDiscount: boolean;
  termInterval: 'monthly' | 'termly' | 'annual';
  pricing: {
    baseRate: number;
    discountAmount: number;
    finalTotal: number;
    registrationFee: number;
  };
}

export interface AdmissionFormData {
  parentFullName: string;
  parentEmail: string;
  parentPhone: string;
  studentFullName: string;
  studentDob: string;
  keyStageId: KeyStageId;
  format: DeliveryFormat;
  selectedSubjects: string[];
  currency: Currency;
  notes?: string;
}

