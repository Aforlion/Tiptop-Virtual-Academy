'use client';

import React, { useTransition } from 'react';
import { deleteCourse } from '@/app/admin/actions';
import { BookOpen, Trash2 } from 'lucide-react';
import DataTable, { Column } from '@/components/ui/DataTable';
import { Course } from '@/lib/types';

interface CoursesTableProps {
  courses: Course[];
  schemaError?: boolean;
}

export default function CoursesTable({ courses, schemaError = false }: CoursesTableProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this course curriculum blueprint? This will delete all associated live sessions.')) {
      startTransition(async () => {
        const result = await deleteCourse(id);
        if (!result.success) {
          alert(result.error);
        }
      });
    }
  };

  const columns: Column<Course>[] = [
    {
      header: 'Course Title',
      accessor: (row) => <span style={{ fontWeight: 600 }}>{row.title}</span>,
    },
    {
      header: 'Age Bracket',
      accessor: (row) => (
        <span className="badge badge-green" style={{ textTransform: 'none' }}>
          Ages {row.min_age}-{row.max_age}
        </span>
      ),
    },
    {
      header: 'Description',
      accessor: (row) => (
        <div style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.85rem', maxWidth: '350px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {row.description}
        </div>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      accessor: (row) => (
        <button
          onClick={() => handleDelete(row.id)}
          disabled={schemaError || isPending}
          className="btn-danger"
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', opacity: schemaError ? 0.5 : 1 }}
        >
          <Trash2 style={{ width: '14px', height: '14px' }} />
        </button>
      ),
    },
  ];

  return (
    <div className="glass-card">
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.25rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <BookOpen style={{ width: '24px', height: '24px', color: 'hsl(var(--accent-pink))' }} /> Curriculum Library
      </h2>
      <DataTable 
        columns={columns} 
        data={courses} 
        emptyMessage="No courses created yet. Populate using the form above!" 
      />
    </div>
  );
}
