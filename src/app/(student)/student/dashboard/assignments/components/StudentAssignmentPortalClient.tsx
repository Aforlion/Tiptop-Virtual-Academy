'use client';

import React, { useState } from 'react';
import { submitAssignment } from '@/app/student/actions';
import { FileText, Send, Clock, CheckCircle2, AlertTriangle, Link as LinkIcon, MessageSquare, Award, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AssignmentItem {
  id: string;
  title: string;
  description: string;
  resource_url?: string | null;
  due_date: string;
  courses?: { title: string } | null;
  submission?: {
    id: string;
    submission_url?: string | null;
    notes?: string | null;
    graded: boolean;
    grade_feedback?: string | null;
    submitted_at: string;
  } | null;
}

interface Props {
  studentId: string;
  assignments: AssignmentItem[];
  isJunior?: boolean;
}

export default function StudentAssignmentPortalClient({ studentId, assignments, isJunior }: Props) {
  const router = useRouter();
  const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent, assignmentId: string) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const res = await submitAssignment(assignmentId, studentId, submissionUrl, notes);
    setSubmitting(false);

    if (res.success) {
      setMessage({ type: 'success', text: res.message || 'Homework submitted successfully!' });
      setActiveSubmissionId(null);
      setSubmissionUrl('');
      setNotes('');
      router.refresh();
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to submit homework.' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: 0, fontFamily: 'var(--font-display)' }}>
          Homework & Assignment Submission Portal
        </h2>
        <p style={{ color: 'hsl(var(--text-secondary))', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
          Upload your completed tasks, view due-date countdowns, and check teacher grade feedback.
        </p>
      </div>

      {message && (
        <div style={{
          padding: '0.85rem 1.25rem',
          borderRadius: '10px',
          fontSize: '0.9rem',
          background: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          color: message.type === 'success' ? '#10b981' : '#ef4444',
          border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
        }}>
          {message.text}
        </div>
      )}

      {assignments.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>
          No homework assignments currently assigned. Check back soon!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {assignments.map(asgn => {
            const dueDate = new Date(asgn.due_date);
            const isPastDue = dueDate < new Date();
            const hasSubmitted = !!asgn.submission;
            const isGraded = asgn.submission?.graded;
            const isSelected = activeSubmissionId === asgn.id;

            return (
              <div key={asgn.id} className="glass-card" style={{ padding: '1.75rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <span className="badge badge-purple" style={{ fontSize: '0.7rem', marginBottom: '0.35rem', display: 'inline-block' }}>
                      {asgn.courses?.title || 'General Course'}
                    </span>
                    <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.25rem', color: '#fff' }}>{asgn.title}</h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {hasSubmitted ? (
                      <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <CheckCircle2 style={{ width: '14px', height: '14px' }} />
                        {isGraded ? 'Graded & Reviewed' : 'Submitted (+75 XP)'}
                      </span>
                    ) : isPastDue ? (
                      <span className="badge badge-pink" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <AlertTriangle style={{ width: '14px', height: '14px' }} /> Past Due
                      </span>
                    ) : (
                      <span className="badge badge-indigo" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock style={{ width: '14px', height: '14px' }} />
                        Due: {dueDate.toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <p style={{ margin: 0, color: 'hsl(var(--text-secondary))', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
                  {asgn.description}
                </p>

                {asgn.resource_url && (
                  <div>
                    <a
                      href={asgn.resource_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#38bdf8', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none' }}
                    >
                      <LinkIcon style={{ width: '14px', height: '14px' }} /> Download Teacher Resource File
                    </a>
                  </div>
                )}

                {/* Submission Details or Form */}
                {hasSubmitted ? (
                  <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1rem 1.25rem', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#10b981', marginBottom: '0.35rem' }}>
                      Submission Record — Submitted on {new Date(asgn.submission!.submitted_at).toLocaleDateString()}
                    </div>
                    {asgn.submission?.submission_url && (
                      <a href={asgn.submission.submission_url} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', fontSize: '0.85rem', display: 'block' }}>
                        🔗 {asgn.submission.submission_url}
                      </a>
                    )}
                    {asgn.submission?.notes && (
                      <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>
                        Notes: {asgn.submission.notes}
                      </p>
                    )}

                    {/* Teacher Feedback Box */}
                    {isGraded && (
                      <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <MessageSquare style={{ width: '14px', height: '14px', color: '#e81cff' }} /> Teacher Feedback & Score:
                        </div>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>
                          {asgn.submission?.grade_feedback || 'Excellent work! Objectives met cleanly.'}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {!isSelected ? (
                      <button
                        onClick={() => setActiveSubmissionId(asgn.id)}
                        className="btn-premium"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.25rem', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}
                      >
                        <Send style={{ width: '16px', height: '16px' }} /> Submit Completed Homework
                      </button>
                    ) : (
                      <form onSubmit={(e) => handleSubmit(e, asgn.id)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: '#fff' }}>Submit Homework for {asgn.title}</h4>
                        
                        <div>
                          <label style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                            Submission File / Document URL (Google Drive, Docs, PDF)
                          </label>
                          <input
                            type="url"
                            required
                            value={submissionUrl}
                            onChange={(e) => setSubmissionUrl(e.target.value)}
                            placeholder="https://docs.google.com/document/d/..."
                            style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem' }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                            Student Notes for Teacher (Optional)
                          </label>
                          <textarea
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add any notes, answers, or comments..."
                            style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem', fontFamily: 'inherit' }}
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                          <button type="button" onClick={() => setActiveSubmissionId(null)} className="btn-secondary" style={{ padding: '0.45rem 1rem' }}>
                            Cancel
                          </button>
                          <button type="submit" disabled={submitting} className="btn-premium" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 1.25rem', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}>
                            {submitting ? <Loader2 className="animate-spin" style={{ width: '16px', height: '16px' }} /> : <Send style={{ width: '16px', height: '16px' }} />}
                            Upload & Complete Task (+75 XP)
                          </button>
                        </div>
                      </form>
                    )}
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
