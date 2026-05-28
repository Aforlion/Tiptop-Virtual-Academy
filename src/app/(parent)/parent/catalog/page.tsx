import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { getAllCourses, getUpcomingSessions, getStudentsByParent } from '@/lib/queries';
import PageHeader from '@/components/layout/PageHeader';
import CatalogClient from './components/CatalogClient';
import CreditBalance from '../components/CreditBalance';
import { getProfile } from '@/lib/queries';
import { getMockDateOffset } from '@/lib/utils';
import { Course, LiveSessionWithCourse, Student, Profile } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function CourseCatalogPage() {
  const supabase = await createClient();

  // 1. Get Logged in Parent User
  const { data: { user } } = await supabase.auth.getUser();
  const parentId = user?.id || 'parent-mock-1';

  let courses: Course[] = [];
  let liveSessions: LiveSessionWithCourse[] = [];
  let students: Student[] = [];
  let parentProfile: Profile | null = null;
  let schemaError = false;

  try {
    const { data: coursesData, error: coursesErr } = await getAllCourses();
    const { data: sessionsData, error: sessionsErr } = await getUpcomingSessions();
    const { data: studentsData, error: studentsErr } = await getStudentsByParent(parentId);
    const { data: profileData } = await getProfile(parentId);

    if (coursesErr || sessionsErr || studentsErr) {
      schemaError = true;
    } else {
      courses = coursesData || [];
      liveSessions = sessionsData || []
      students = studentsData || [];
      parentProfile = profileData;
    }
  } catch {
    schemaError = true;
  }

  // Fallback Mock Data if schema isn't set up yet
  if (schemaError || courses.length === 0) {
    courses = [
      { id: '1', title: 'Creative Coding & Logic Loops', description: 'Early programming blocks, problem solving, and design patterns.', min_age: 5, max_age: 8, is_published: true, created_at: '' },
      { id: '2', title: 'Cosmic Astrophysics for Tiny Minds', description: 'Explore stars, gravity, planets, and quantum gravity.', min_age: 7, max_age: 12, is_published: true, created_at: '' },
      { id: '3', title: 'Intro to Game Design & Python', description: 'Build your first 2D platformer game using pure logic.', min_age: 9, max_age: 12, is_published: true, created_at: '' }
    ];
  }

  if (schemaError || liveSessions.length === 0) {
    liveSessions = [
      { 
        id: 'session-1', 
        course_id: '1',
        teacher_name: 'Professor Barbara', 
        meeting_token: 'room-astro', 
        scheduled_start: getMockDateOffset(5), // starts in 5 minutes!
        scheduled_end: getMockDateOffset(65),
        session_type: 'flexible',
        max_seats: 15,
        status: 'scheduled',
        created_at: '',
        courses: courses[1]
      },
      { 
        id: 'session-2', 
        course_id: '2',
        teacher_name: 'Dr. Sarah', 
        meeting_token: 'room-coding', 
        scheduled_start: getMockDateOffset(24 * 60), 
        scheduled_end: getMockDateOffset(25 * 60),
        session_type: 'cohort',
        max_seats: 15,
        status: 'scheduled',
        created_at: '',
        courses: courses[0]
      }
    ];
  }

  if (!parentProfile) {
    parentProfile = { id: parentId, flexible_credits: 10 } as Profile;
  }

  return (
    <>
      <PageHeader
        title="Curriculum Catalog"
        subtitle="Explore our active curriculum pathways and schedule slots for your registered children."
        action={<CreditBalance credits={parentProfile.flexible_credits} />}
      />

      {schemaError && (
        <div className="glass-card" style={{ 
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          marginBottom: '2rem'
        }}>
          <p style={{ color: '#f59e0b', fontSize: '0.9rem', fontWeight: 500 }}>
            ⚠️ Running in offline sandbox mode. Copy the Postgres script in **migration_001_foundation.sql** and run it in the Supabase SQL editor to connect your actual database tables.
          </p>
        </div>
      )}

      <CatalogClient 
        courses={courses} 
        liveSessions={liveSessions} 
        students={students} 
      />
    </>
  );
}
