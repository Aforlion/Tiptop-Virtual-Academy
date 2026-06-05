'use client';

import React, { useState } from 'react';
import { Student } from '@/lib/types';
import { useRouter, usePathname } from 'next/navigation';
import { 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  TrendingUp, 
  HelpCircle,
  FileText,
  User,
  ShieldAlert
} from 'lucide-react';

interface ParentReportsClientProps {
  students: Student[];
  activeStudent: Student | { id: string; first_name: string };
  submissions: any[];
  isDemo: boolean;
}

export default function ParentReportsClient({
  students,
  activeStudent,
  submissions,
  isDemo,
}: ParentReportsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);

  const handleStudentChange = (studentId: string) => {
    router.push(`${pathname}?studentId=${studentId}`);
  };

  const toggleExpand = (subId: string) => {
    setExpandedSubId(prev => (prev === subId ? null : subId));
  };

  // Calculate summary stats
  const totalSubmissions = submissions.length;
  const avgPercentage = totalSubmissions > 0
    ? Math.round(submissions.reduce((acc, sub) => acc + parseFloat(sub.percentage), 0) / totalSubmissions)
    : 0;

  const totalCorrect = submissions.reduce((acc, sub) => acc + sub.correct_count, 0);
  const totalIncorrect = submissions.reduce((acc, sub) => acc + sub.incorrect_count, 0);
  const totalSkipped = submissions.reduce((acc, sub) => acc + sub.skipped_count, 0);
  const totalQuestions = totalCorrect + totalIncorrect + totalSkipped;

  // Donut chart math
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (avgPercentage / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Student Selector Row */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'linear-gradient(135deg, hsl(var(--accent-purple)), hsl(var(--accent-pink)))',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <User style={{ width: '20px', height: '20px', color: '#fff' }} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Select Student</h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>Viewing report details for {activeStudent.first_name}</p>
          </div>
        </div>

        {students.length > 0 ? (
          <select
            className="form-select"
            value={activeStudent.id}
            onChange={(e) => handleStudentChange(e.target.value)}
            style={{ minWidth: '200px' }}
          >
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.first_name}</option>
            ))}
          </select>
        ) : (
          <span className="badge badge-purple">Demo Account</span>
        )}
      </div>

      {isDemo && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '1rem', borderRadius: 'var(--radius-lg)',
          background: 'rgba(217, 119, 6, 0.1)', border: '1px solid rgba(217, 119, 6, 0.2)',
          color: '#f59e0b', fontSize: '0.9rem'
        }}>
          <ShieldAlert style={{ width: '20px', height: '20px', flexShrink: 0 }} />
          <div>
            <strong>Demo Mode:</strong> Displaying sample assessment submissions for {activeStudent.first_name}. Real submissions will populate here once quizzes are submitted.
          </div>
        </div>
      )}

      {/* Analytics Dashboard Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem', alignItems: 'start' }} className="reports-layout-grid">
        
        {/* Left Widget: Circular Donut Chart */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Average Score</h3>

          {/* SVG Donut Chart */}
          <div style={{ position: 'relative', width: '150px', height: '150px', marginBottom: '1.5rem' }}>
            <svg style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
              {/* Background circle */}
              <circle
                cx="75" cy="75" r={radius}
                fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="12"
              />
              {/* Foreground circle representing percentage */}
              <circle
                cx="75" cy="75" r={radius}
                fill="transparent"
                stroke="url(#purplePinkGradient)"
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
              />
              {/* Gradients */}
              <defs>
                <linearGradient id="purplePinkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--accent-purple))" />
                  <stop offset="100%" stopColor="hsl(var(--accent-pink))" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}>
              <span style={{ fontSize: '2.2rem', fontWeight: 800 }}>{avgPercentage}%</span>
              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Overall Correct
              </span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.25rem', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <span style={{ color: 'hsl(var(--text-secondary))' }}>Quizzes Taken:</span>
              <strong style={{ color: '#fff' }}>{totalSubmissions}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'hsl(var(--text-secondary))' }}>Question Ratio:</span>
              <strong style={{ color: '#fff' }}>{totalCorrect}/{totalQuestions}</strong>
            </div>
          </div>
        </div>

        {/* Right Panel: Submissions Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText style={{ width: '20px', height: '20px', color: 'hsl(var(--accent-purple))' }} />
            Quiz History &amp; Breakdown
          </h3>

          {submissions.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
              <AlertCircle style={{ width: '36px', height: '36px', margin: '0 auto 1rem', opacity: 0.5 }} />
              <h3>No assessments completed</h3>
              <p style={{ fontSize: '0.9rem' }}>Quiz performance reports will appear once assessments are submitted.</p>
            </div>
          ) : (
            submissions.map((sub) => {
              const isExpanded = expandedSubId === sub.id;

              return (
                <div key={sub.id} className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  
                  {/* Summary row */}
                  <div 
                    onClick={() => toggleExpand(sub.id)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', flexWrap: 'wrap', gap: '1rem' }}
                  >
                    <div>
                      <h4 style={{ fontSize: '1.1rem', margin: 0 }}>{sub.assessments?.title || 'Assessment'}</h4>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'hsl(var(--text-muted))', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>Completed: {new Date(sub.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <Clock style={{ width: '12px', height: '12px' }} />
                          {Math.round(sub.time_spent_secs / 60)} mins
                        </span>
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: sub.percentage >= 80 ? '#34d399' : sub.percentage >= 50 ? '#f59e0b' : '#f87171' }}>
                          {sub.percentage}%
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
                          Score: {sub.score} pts
                        </span>
                      </div>
                      {isExpanded ? <ChevronUp style={{ width: '20px', height: '20px' }} /> : <ChevronDown style={{ width: '20px', height: '20px' }} />}
                    </div>
                  </div>

                  {/* Expanded Breakdown Table */}
                  {isExpanded && (
                    <div style={{
                      borderTop: '1px solid rgba(255,255,255,0.05)',
                      paddingTop: '1.25rem',
                      marginTop: '0.5rem',
                      overflowX: 'auto'
                    }}>
                      <h5 style={{ fontSize: '0.9rem', color: 'hsl(var(--accent-cyan))', marginBottom: '0.75rem' }}>
                        Question Details
                      </h5>
                      <table className="premium-table" style={{ width: '100%', fontSize: '0.85rem' }}>
                        <thead>
                          <tr>
                            <th style={{ padding: '0.5rem' }}>Question</th>
                            <th style={{ padding: '0.5rem' }}>Difficulty</th>
                            <th style={{ padding: '0.5rem' }}>Your Answer</th>
                            <th style={{ padding: '0.5rem' }}>Correct Answer</th>
                            <th style={{ padding: '0.5rem' }}>Result</th>
                            <th style={{ padding: '0.5rem', textAlign: 'right' }}>Points</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sub.responses.map((resp: any, idx: number) => (
                            <tr key={idx}>
                              <td style={{ padding: '0.65rem 0.5rem', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {resp.question_text}
                              </td>
                              <td style={{ padding: '0.65rem 0.5rem' }}>
                                <span className="badge" style={{
                                  fontSize: '0.65rem', padding: '0 0.4rem',
                                  background: resp.difficulty === 'easy' ? 'rgba(16,185,129,0.1)' : resp.difficulty === 'medium' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                                  color: resp.difficulty === 'easy' ? '#34d399' : resp.difficulty === 'medium' ? '#f59e0b' : '#f87171',
                                }}>
                                  {resp.difficulty}
                                </span>
                              </td>
                              <td style={{ padding: '0.65rem 0.5rem', color: resp.is_correct ? '#34d399' : '#f87171' }}>
                                {Array.isArray(resp.user_answer) ? resp.user_answer.join(', ') : (resp.user_answer || '(Skipped)')}
                              </td>
                              <td style={{ padding: '0.65rem 0.5rem', color: 'hsl(var(--text-secondary))' }}>
                                {Array.isArray(resp.correct_answer) ? resp.correct_answer.join(', ') : (resp.correct_answer || 'N/A')}
                              </td>
                              <td style={{ padding: '0.65rem 0.5rem' }}>
                                {resp.is_correct ? (
                                  <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                    <CheckCircle2 style={{ width: '14px', height: '14px' }} /> Correct
                                  </span>
                                ) : resp.user_answer === undefined || resp.user_answer === '' ? (
                                  <span style={{ color: 'hsl(var(--text-muted))', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                    <HelpCircle style={{ width: '14px', height: '14px' }} /> Skipped
                                  </span>
                                ) : (
                                  <span style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                    <XCircle style={{ width: '14px', height: '14px' }} /> Incorrect
                                  </span>
                                )}
                              </td>
                              <td style={{ padding: '0.65rem 0.5rem', textAlign: 'right', fontWeight: 'bold' }}>
                                {resp.is_correct ? `+${resp.points}` : '0'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

      </div>

      <style>{`
        @media (max-width: 1024px) {
          .reports-layout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
}
