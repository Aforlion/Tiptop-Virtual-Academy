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

export interface AdmissionApplication {
  id: string;
  created_at: string;
  parent_name: string;
  parent_email: string;
  parent_phone?: string;
  parent_country?: string;
  student_first_name: string;
  student_last_name: string;
  student_date_of_birth: string;
  key_stage_code: string;
  delivery_format: 'live' | 'on-demand' | 'bundle';
  selected_subjects: string[];
  deposit_amount: number;
  currency: Currency | string;
  paystack_reference?: string;
  payment_status: 'pending' | 'deposit_paid' | 'failed' | 'refunded';
  status: 'inquiry' | 'under_review' | 'admitted' | 'enrolled' | 'rejected' | 'withdrawn';
  admin_notes?: string;
}


