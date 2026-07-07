'use client';

import React, { useState, useActionState, useTransition } from 'react';
import { upsertLessonPlan, deleteLessonPlan } from '@/app/teacher/actions';
import { BookOpen, Edit2, Trash2, Plus, X, Loader2, Sparkles, ChevronRight, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { EYFS_NURSERY_PLAN, EYFS_RECEPTION_PLAN, EYFSWeekPlan } from '@/lib/curriculum-data';

interface Course {
  id: string;
  title: string;
}

interface LessonPlan {
  id: string;
  teacher_id: string;
  course_id: string;
  title: string;
  content: string;
  created_at: string;
  courses: {
    title: string;
  } | null;
}

interface LessonPlansClientProps {
  initialPlans: LessonPlan[];
  courses: Course[];
}

export default function LessonPlansClient({ initialPlans, courses }: LessonPlansClientProps) {
  const router = useRouter();
  const [plans, setPlans] = useState<LessonPlan[]>(initialPlans);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form State
  const [editingPlan, setEditingPlan] = useState<LessonPlan | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState('');

  // Curriculum Reference State
  const [refAge, setRefAge] = useState<'nursery' | 'reception'>('nursery');
  const [refWeek, setRefWeek] = useState<number>(1);
  const [isTemplateApplied, setIsTemplateApplied] = useState(false);

  // useActionState for handling the upsert form
  const [state, formAction, isFormPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const result = await upsertLessonPlan(prevState, formData);
      if (result.success) {
        // Reset form on success
        setShowForm(false);
        setEditingPlan(null);
        setContent('');
        router.refresh();
      }
      return result;
    },
    null
  );

  const handleEdit = (plan: LessonPlan) => {
    setEditingPlan(plan);
    setContent(plan.content);
    setIsTemplateApplied(false);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateNew = () => {
    setEditingPlan(null);
    setContent('');
    setIsTemplateApplied(false);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPlan(null);
    setContent('');
    setIsTemplateApplied(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lesson plan?')) return;

    setIsDeletingId(id);
    const result = await deleteLessonPlan(id);
    setIsDeletingId(null);

    if (result.success) {
      setPlans(prev => prev.filter(p => p.id !== id));
      router.refresh();
    } else {
      alert(result.error || 'Failed to delete lesson plan');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Header / Action Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0 }}>
          Your Lesson Collections
        </h2>
        {!showForm && (
          <button
            onClick={handleCreateNew}
            className="btn-premium"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'linear-gradient(135deg, hsl(var(--accent-purple)) 0%, hsl(var(--accent-indigo)) 100%)'
            }}
          >
            <Plus style={{ width: '18px', height: '18px' }} />
            New Lesson Plan
          </button>
        )}
      </div>

      {/* Form Section */}
      {showForm && (
        <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
              {editingPlan ? 'Edit Lesson Plan' : 'Create New Lesson Plan'}
            </h3>
            <button
              onClick={handleCancel}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'hsl(var(--text-muted))',
                cursor: 'pointer'
              }}
            >
              <X style={{ width: '20px', height: '20px' }} />
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
            gap: '2rem'
          }}>
            {/* Left Column: Form */}
            <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {editingPlan && <input type="hidden" name="id" value={editingPlan.id} />}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="courseId" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff' }}>
                  Course Blueprint
                </label>
                <select
                  id="courseId"
                  name="courseId"
                  defaultValue={editingPlan?.course_id || ''}
                  required
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    width: '100%',
                    fontSize: '0.95rem'
                  }}
                >
                  <option value="" disabled style={{ background: '#0d0d12' }}>Select a Course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id} style={{ background: '#0d0d12' }}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="title" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff' }}>
                  Lesson Title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  defaultValue={editingPlan?.title || ''}
                  required
                  placeholder="e.g., Introduction to Python Variables"
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    width: '100%',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="content" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff' }}>
                  Lesson Content & Outline
                </label>
                <textarea
                  id="content"
                  name="content"
                  rows={10}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  placeholder="Write down the details, objectives, activities, and homework instructions here..."
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    width: '100%',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              {state && !state.success && (
                <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  {state.error}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-secondary"
                  disabled={isFormPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-premium"
                  disabled={isFormPending}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'linear-gradient(135deg, hsl(var(--accent-purple)) 0%, hsl(var(--accent-indigo)) 100%)'
                  }}
                >
                  {isFormPending ? (
                    <>
                      <Loader2 className="animate-spin" style={{ width: '16px', height: '16px' }} />
                      Saving...
                    </>
                  ) : (
                    'Save Lesson Plan'
                  )}
                </button>
              </div>
            </form>

            {/* Right Column: EYFS Reference Guide */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles style={{ width: '18px', height: '18px', color: 'hsl(var(--accent-purple))' }} />
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                  EYFS Long Term Reference
                </h4>
              </div>

              {/* Reference selectors */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label htmlFor="refAgeSelect" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '0.25rem' }}>
                    Age Group
                  </label>
                  <select
                    id="refAgeSelect"
                    value={refAge}
                    onChange={(e) => setRefAge(e.target.value as 'nursery' | 'reception')}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                      width: '100%',
                      fontSize: '0.85rem'
                    }}
                  >
                    <option value="nursery" style={{ background: '#0d0d12' }}>Nursery (3-4)</option>
                    <option value="reception" style={{ background: '#0d0d12' }}>Reception (4-5)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="refWeekSelect" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '0.25rem' }}>
                    Curriculum Week
                  </label>
                  <select
                    id="refWeekSelect"
                    value={refWeek}
                    onChange={(e) => setRefWeek(Number(e.target.value))}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                      width: '100%',
                      fontSize: '0.85rem'
                    }}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(wk => (
                      <option key={wk} value={wk} style={{ background: '#0d0d12' }}>
                        Week {wk} (Autumn)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Displaying Current Reference Data */}
              {(() => {
                const planList = refAge === 'nursery' ? EYFS_NURSERY_PLAN : EYFS_RECEPTION_PLAN;
                const weekPlan = planList.find(w => w.week === refWeek);
                if (!weekPlan) {
                  return (
                    <div style={{ padding: '1rem', color: 'hsl(var(--text-muted))', fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center' }}>
                      No reference mappings for Week {refWeek}
                    </div>
                  );
                }

                const handleApplyTemplate = () => {
                  const template = `## Week ${weekPlan.week} Lesson Plan: ${weekPlan.theme}

### 1. Objectives & Focus Areas
- **Communication & Language**: ${weekPlan.communication_language}
- **Personal, Social & Emotional (PSED)**: ${weekPlan.psed}
- **Physical Development**: ${weekPlan.physical_development}
- **Literacy**: ${weekPlan.literacy}
- **Mathematics**: ${weekPlan.mathematics}
- **Understanding the World**: ${weekPlan.understanding_the_world}
- **Expressive Arts & Design**: ${weekPlan.expressive_arts_design}

### 2. Live Interactive Class Outline
- [Write live class schedule and activities here...]

### 3. Independent & Asynchronous Activities
- [Write home-play or pre-recorded instructions here...]
`;
                  setContent(template);
                  setIsTemplateApplied(true);
                  setTimeout(() => setIsTemplateApplied(false), 2000);
                };

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', flexGrow: 1 }}>
                    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'hsl(var(--accent-pink))', fontWeight: 600 }}>THEME</span>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{weekPlan.theme}</div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '240px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', fontWeight: 600, display: 'block', marginBottom: '0.15rem' }}>COMMUNICATION & LANGUAGE</span>
                        <div style={{ color: 'hsl(var(--text-secondary))', lineHeight: '1.4' }}>{weekPlan.communication_language}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', fontWeight: 600, display: 'block', marginBottom: '0.15rem' }}>PSED</span>
                        <div style={{ color: 'hsl(var(--text-secondary))', lineHeight: '1.4' }}>{weekPlan.psed}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', fontWeight: 600, display: 'block', marginBottom: '0.15rem' }}>MATHEMATICS</span>
                        <div style={{ color: 'hsl(var(--text-secondary))', lineHeight: '1.4' }}>{weekPlan.mathematics}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', fontWeight: 600, display: 'block', marginBottom: '0.15rem' }}>LITERACY</span>
                        <div style={{ color: 'hsl(var(--text-secondary))', lineHeight: '1.4' }}>{weekPlan.literacy}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleApplyTemplate}
                      className="btn-secondary"
                      style={{
                        marginTop: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '0.6rem 1rem',
                        fontSize: '0.85rem',
                        borderColor: 'hsl(var(--accent-purple))',
                        color: 'hsl(var(--accent-purple))'
                      }}
                    >
                      {isTemplateApplied ? (
                        <>
                          <Check style={{ width: '16px', height: '16px', color: '#10b981' }} /> Applied to Editor!
                        </>
                      ) : (
                        <>
                          <ChevronRight style={{ width: '16px', height: '16px' }} /> Auto-Fill Lesson Outline
                        </>
                      )}
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Plans List */}
      {plans.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
          <BookOpen style={{ width: '40px', height: '40px', color: 'hsl(var(--text-muted))', margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>No Lesson Plans Created Yet</h3>
          <p style={{ color: 'hsl(var(--text-secondary))', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
            Build and structure your lesson plans to organize your curriculum and guide your students.
          </p>
          <button onClick={handleCreateNew} className="btn-secondary">Create Your First Plan</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="glass-card"
              style={{
                padding: '1.5rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                transition: 'var(--transition-smooth)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <span className="badge badge-purple" style={{ alignSelf: 'flex-start', fontSize: '0.75rem', marginBottom: '0.5rem', display: 'inline-block' }}>
                    {plan.courses?.title || 'General Blueprint'}
                  </span>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                    {plan.title}
                  </h3>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => handleEdit(plan)}
                    className="btn-secondary"
                    style={{ padding: '0.5rem', minWidth: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Edit Lesson Plan"
                  >
                    <Edit2 style={{ width: '16px', height: '16px' }} />
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="btn-secondary"
                    style={{ 
                      padding: '0.5rem', 
                      minWidth: '40px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      borderColor: 'rgba(239, 68, 68, 0.2)',
                      color: 'hsl(var(--accent-pink))'
                    }}
                    title="Delete Lesson Plan"
                    disabled={isDeletingId === plan.id}
                  >
                    {isDeletingId === plan.id ? (
                      <Loader2 className="animate-spin" style={{ width: '16px', height: '16px' }} />
                    ) : (
                      <Trash2 style={{ width: '16px', height: '16px' }} />
                    )}
                  </button>
                </div>
              </div>

              {/* Collapsed/Formatted Content Preview */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.2)',
                padding: '1.25rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.02)',
                color: 'hsl(var(--text-secondary))',
                fontSize: '0.9rem',
                whiteSpace: 'pre-wrap',
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {plan.content}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
                Created: {new Date(plan.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
