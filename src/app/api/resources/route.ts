import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { LearningResource } from '@/types';

// Curated pedagogical seed resources for TVA 2.0 Resource Vault
const SEED_RESOURCES: LearningResource[] = [
  {
    id: 'res-001',
    key_stage_code: 'primary',
    subject_code: 'NIG-SOC',
    title: 'Nigerian Civic Rights & The Constitution: Module 1',
    description: 'Foundations of civic responsibility, national symbols, and fundamental human rights under the Nigerian Constitution.',
    resource_type: 'slides',
    file_url: 'https://docs.google.com/presentation/d/sample-nig-soc',
    week_number: 1,
    term_number: 1,
    academic_year: '2026/2027',
    is_published: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
  },
  {
    id: 'res-002',
    key_stage_code: 'primary',
    subject_code: 'MATH',
    title: 'Fractions, Decimals & Percentages Video Masterclass',
    description: '25-minute on-demand walkthrough on calculating fractional parts and real-world currency percentages with Ms. Harrison.',
    resource_type: 'video',
    file_url: 'https://www.youtube-nocookie.com/embed/sample-math-fractions',
    week_number: 2,
    term_number: 1,
    academic_year: '2026/2027',
    is_published: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
  },
  {
    id: 'res-003',
    key_stage_code: 'primary',
    subject_code: 'ENG',
    title: 'Creative Narrative Writing: Descriptive Atmosphere Worksheet',
    description: 'Sensory writing prompts and vocabulary exercises for Key Stage 2 creative literacy homework.',
    resource_type: 'worksheet',
    file_url: 'https://drive.google.com/file/d/sample-eng-worksheet',
    week_number: 2,
    term_number: 1,
    academic_year: '2026/2027',
    is_published: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString()
  },
  {
    id: 'res-004',
    key_stage_code: 'primary',
    subject_code: 'SCI',
    title: 'Photosynthesis & Plant Cell Biology Slides',
    description: 'Interactive diagrams illustrating chlorophyll absorption, stomata gas exchange, and plant nutrition cycles.',
    resource_type: 'slides',
    file_url: 'https://docs.google.com/presentation/d/sample-sci-cells',
    week_number: 3,
    term_number: 1,
    academic_year: '2026/2027',
    is_published: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
  },
  {
    id: 'res-005',
    key_stage_code: 'lower-sec',
    subject_code: 'NIG-HIST',
    title: 'Pre-Colonial Kingdoms: The Benin & Oyo Empires Video Masterclass',
    description: 'Comprehensive historical survey of the architectural, artistic, and political systems of the Benin and Oyo empires.',
    resource_type: 'video',
    file_url: 'https://www.youtube-nocookie.com/embed/sample-nig-hist-empires',
    week_number: 1,
    term_number: 1,
    academic_year: '2026/2027',
    is_published: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString()
  },
  {
    id: 'res-006',
    key_stage_code: 'upper-sec',
    subject_code: 'COMP',
    title: 'Python Algorithms & Data Structures: IGCSE Lab Manual',
    description: 'Practical coding exercises focusing on sorting algorithms, conditional branching, and pseudocode synthesis.',
    resource_type: 'worksheet',
    file_url: 'https://drive.google.com/file/d/sample-cs-algorithms',
    week_number: 4,
    term_number: 1,
    academic_year: '2026/2027',
    is_published: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
  },
  {
    id: 'res-007',
    key_stage_code: 'eyfs',
    subject_code: 'ENG',
    title: 'Early Phonics & Sound Blending Interactive Playbook',
    description: 'Vibrant visual cards and interactive audio prompts designed for early learners aged 3–5.',
    resource_type: 'slides',
    file_url: 'https://docs.google.com/presentation/d/sample-eyfs-phonics',
    week_number: 1,
    term_number: 1,
    academic_year: '2026/2027',
    is_published: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString()
  }
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const keyStage = searchParams.get('key_stage');
    const subject = searchParams.get('subject');
    const type = searchParams.get('type');
    const search = searchParams.get('search')?.toLowerCase().trim();

    const supabase = getAdminClient();

    let query = supabase
      .from('resource_vault')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (keyStage && keyStage !== 'all') {
      query = query.eq('key_stage_code', keyStage);
    }
    if (subject && subject !== 'all') {
      query = query.eq('subject_code', subject);
    }
    if (type && type !== 'all') {
      query = query.eq('resource_type', type);
    }

    const { data, error } = await query;

    let resources: LearningResource[] = [];

    if (error || !data || data.length === 0) {
      resources = [...SEED_RESOURCES];

      if (keyStage && keyStage !== 'all') {
        resources = resources.filter((r) => r.key_stage_code === keyStage);
      }
      if (subject && subject !== 'all') {
        resources = resources.filter((r) => r.subject_code === subject);
      }
      if (type && type !== 'all') {
        resources = resources.filter((r) => r.resource_type === type);
      }
    } else {
      resources = data as LearningResource[];
    }

    if (search) {
      resources = resources.filter((r) => {
        const title = r.title.toLowerCase();
        const desc = (r.description || '').toLowerCase();
        const subj = r.subject_code.toLowerCase();
        return title.includes(search) || desc.includes(search) || subj.includes(search);
      });
    }

    return NextResponse.json({
      success: true,
      count: resources.length,
      resources
    });
  } catch (err: any) {
    console.error('Failed to query resource vault:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to query resource vault', resources: SEED_RESOURCES },
      { status: 500 }
    );
  }
}

