import { createClient } from '@/lib/supabase/client';
import { PricingEngine, Product, StudentEnrollmentInput, PricingCalculationResult } from '@/lib/pricing/PricingEngine';

export interface EnrollmentWizardState {
  step: 1 | 2 | 3 | 4; // 1: Select Product, 2: Parent & Student Details, 3: Document Upload & Review, 4: Payment & Provisioning
  selectedProduct: Product | null;
  referralCode: string;
  students: StudentEnrollmentInput[];
  pricingResult: PricingCalculationResult | null;
  isSubmitting: boolean;
  errorMessage: string | null;
  completedEnrollmentId: string | null;
}

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Full Time Early Years',
    code: 'FT-EY',
    description: 'Ages 3-5 complete Early Years Foundation Stage program',
    category: 'full_time',
    base_price_ngn: 600000,
    registration_fee_ngn: 50000,
    pricing_model: 'termly',
    is_active: true
  },
  {
    id: 'prod-2',
    name: 'Full Time Primary',
    code: 'FT-PRI',
    description: 'Ages 6-11 British Primary curriculum cohort enrollment',
    category: 'full_time',
    base_price_ngn: 750000,
    registration_fee_ngn: 70000,
    pricing_model: 'termly',
    is_active: true
  },
  {
    id: 'prod-3',
    name: 'Full Time Secondary',
    code: 'FT-SEC',
    description: 'Ages 11-16 British Secondary curriculum cohort enrollment',
    category: 'full_time',
    base_price_ngn: 900000,
    registration_fee_ngn: 70000,
    pricing_model: 'termly',
    is_active: true
  },
  {
    id: 'prod-4',
    name: 'Individual Subject (KS 2/3)',
    code: 'IND-KS23',
    description: 'Single subject enrollment for Key Stage 2 or 3',
    category: 'subject',
    base_price_ngn: 70000,
    registration_fee_ngn: 0,
    pricing_model: 'termly',
    is_active: true
  },
  {
    id: 'prod-5',
    name: 'After School Support (Group)',
    code: 'SUP-GRP',
    description: 'Group support classes after regular school hours',
    category: 'support',
    base_price_ngn: 50000,
    registration_fee_ngn: 0,
    pricing_model: 'termly',
    is_active: true
  },
  {
    id: 'prod-6',
    name: 'Holiday Classes',
    code: 'HOL-CLS',
    description: 'Intensive holiday learning bootcamps and classes',
    category: 'holiday',
    base_price_ngn: 150000,
    registration_fee_ngn: 0,
    pricing_model: 'one_time',
    is_active: true
  },
  {
    id: 'prod-7',
    name: 'Cambridge / IGCSE Prep',
    code: 'IGCSE-PREP',
    description: 'Per subject Cambridge Checkpoint and IGCSE preparation',
    category: 'subject',
    base_price_ngn: 100000,
    registration_fee_ngn: 0,
    pricing_model: 'termly',
    is_active: true
  },
  {
    id: 'prod-8',
    name: 'One-to-One Tutoring',
    code: 'TUT-1ON1',
    description: 'Personalized private tutoring session package',
    category: 'tutoring',
    base_price_ngn: 70000,
    registration_fee_ngn: 0,
    pricing_model: 'monthly',
    is_active: true
  }
];
