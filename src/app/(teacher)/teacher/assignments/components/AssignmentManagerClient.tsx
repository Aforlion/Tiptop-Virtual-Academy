'use client';

import React, { useState, useActionState } from 'react';
import { createAssignment } from '@/app/teacher/actions';
import { FileText, Plus, Calendar, Link as LinkIcon, CheckCircle2, Send, Clock, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Course {
  id: string;
  title: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  resource_url?: string | null;
  due_date: string;
  published_to_classroom: boolean;
  created_at: string;
  courses?: { title: string } | null;
  assignment_submissions?: any[];
}

interface Props {
  initialAssignments: Assignment[];
  courses: Course[];
}

export default function AssignmentManagerClient({ initialAssignments, courses }: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const res = await createAssignment(prevState, formData);
      if (res.success) {
        setShowForm(false);
        router.refresh();
      }
      return res;
    },
    null
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header & Create Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0 }}>
          Assigned Homework & Tasks ({initialAssignments.length})
        </h2>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-premium"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}
          >
            <Plus style={{ width: '18px', height: '18px' }} /> Create Assignment
          </button>
        )}
      </div>

      {/* Creation Modal / Form */}
      {showForm && (
        <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.25rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText style={{ width: '20px', height: '20px', color: '#10b981' }} /> Create Homework Assignment
            </h3>
            <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}>
              <X style={{ width: '20px', height: '20px' }} />
            </button>
          </div>

          <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', display: 'block', marginBottom: '0.35rem' }}>
                  Target Course
                </label>
                <select
                  name="courseId"
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                >
                  <option value="" disabled selected style={{ background: '#0d0d12' }}>Select Course Roster</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id} style={{ background: '#0d0d12' }}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', display: 'block', marginBottom: '0.35rem' }}>
                  Assignment Title
                </label>
                <input
                  name="title"
                  type="text"
                  required
                  placeholder="e.g. Key Stage 2 Fractions & Decimals Worksheet"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', display: 'block', marginBottom: '0.35rem' }}>
                  Submission Due Date
                </label>
                <input
                  name="dueDate"
                  type="datetime-local"
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', display: 'block', marginBottom: '0.35rem' }}>
                  Resource URL (Optional Link / Google Drive)
                </label>
                <input
                  name="resourceUrl"
                  type="url"
                  placeholder="https://drive.google.com/..."
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', display: 'block', marginBottom: '0.35rem' }}>
                Instructions & Task Description
              </label>
              <textarea
                name="description"
                rows={4}
                required
                placeholder="Detailed instructions for students and parents..."
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" id="publishToClassroom" name="publishToClassroom" value="true" defaultChecked />
              <label htmlFor="publishToClassroom" style={{ fontSize: '0.85rem', color: '#fff', cursor: 'pointer' }}>
                Automatically publish to Google Classroom & sync with Parent Portal feeds
              </label>
            </div>

            {state && !state.success && (
              <div style={{ color: '#ef4444', fontSize: '0.85rem' }}>{state.error}</div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={isPending} className="btn-premium" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}>
                {isPending ? <Loader2 className="animate-spin" style={{ width: '16px', height: '16px' }} /> : <Send style={{ width: '16px', height: '16px' }} />}
                Publish Assignment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assignment List */}
      {initialAssignments.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>
          No homework assignments have been published yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {initialAssignments.map(asgn => {
            const dueDate = new Date(asgn.due_date);
            const isPastDue = dueDate < new Date();
            const submissionCount = asgn.assignment_submissions?.length || 0;

            return (
              <div key={asgn.id} className="glass-card" style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                        {asgn.courses?.title || 'General Course'}
                      </span>
                      {asgn.published_to_classroom && (
                        <span className="badge badge-green" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <CheckCircle2 style={{ width: '12px', height: '12px' }} /> Google Classroom Synced
                        </span>
                      )}
                    </div>
                    <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.25rem', color: '#fff' }}>{asgn.title}</h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem' }}>
                    <div style={{ color: isPastDue ? '#ef4444' : '#10b981', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                      <Clock style={{ width: '16px', height: '16px' }} />
                      Due: {dueDate.toLocaleDateString()} at {dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <span className="badge badge-indigo" style={{ fontSize: '0.75rem' }}>
                      {submissionCount} Submissions Received
                    </span>
                  </div>
                </div>

                <p style={{ margin: 0, color: 'hsl(var(--text-secondary))', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
                  {asgn.description}
                </p>

                {asgn.resource_url && (
                  <div style={{ marginTop: '0.25rem' }}>
                    <a
                      href={asgn.resource_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#38bdf8', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none' }}
                    >
                      <LinkIcon style={{ width: '14px', height: '14px' }} /> View Attached Teaching Resource
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
