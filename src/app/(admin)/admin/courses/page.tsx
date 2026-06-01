import React from 'react';
import { getAllCourses } from '@/lib/queries';
import PageHeader from '@/components/layout/PageHeader';
import CoursesTable from '../components/CoursesTable';
import CreateCourseForm from '../components/CreateCourseForm';
import { Course } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminCoursesPage() {
  let courses: Course[] = [];
  let schemaError = false;

  try {
    const { data: coursesData, error: coursesErr } = await getAllCourses();
    if (coursesErr) {
      schemaError = true;
    } else {
      courses = coursesData || [];
    }
  } catch {
    schemaError = true;
  }

  // Fallback Mock Data
  if (schemaError || courses.length === 0) {
    courses = [
      { id: '1', title: 'Creative Coding & Logic Loops', description: 'Early programming blocks, problem solving, and design patterns.', min_age: 5, max_age: 8, is_published: true, created_at: '' },
      { id: '2', title: 'Cosmic Astrophysics for Tiny Minds', description: 'Explore stars, gravity, planets, and quantum gravity.', min_age: 7, max_age: 12, is_published: true, created_at: '' },
    ];
  }

  return (
    <>
      <PageHeader
        title="Course Management"
        subtitle="Create, update, and manage the curriculum library."
      />
      <div className="grid-2" style={{ marginBottom: '2.5rem', alignItems: 'start' }}>
        <CreateCourseForm />
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', padding: '3rem 2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'hsl(var(--accent-cyan))' }}>Curriculum Insights</h3>
          <p style={{ color: 'hsl(var(--foreground-muted))' }}>
            Active Courses: {courses.length}<br/>
            Draft Courses: {courses.filter(c => !c.is_published).length}
          </p>
        </div>
      </div>
      <CoursesTable courses={courses} schemaError={schemaError} />
    </>
  );
}
