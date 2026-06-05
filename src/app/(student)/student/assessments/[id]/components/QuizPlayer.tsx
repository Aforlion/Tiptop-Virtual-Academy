'use client';

import React, { useState, useEffect, useRef, useTransition, useActionState } from 'react';
import { Assessment, AssessmentQuestion } from '@/lib/types';
import { submitAssessmentResponse } from '@/app/admin/actions';
import { 
  Timer, 
  HelpCircle, 
  CheckCircle, 
  Bookmark, 
  ChevronLeft, 
  ChevronRight, 
  Award, 
  Trophy,
  Activity,
  BookmarkCheck,
  Send
} from 'lucide-react';
import Link from 'next/link';

interface QuizPlayerProps {
  assessment: Assessment;
  questions: AssessmentQuestion[];
  studentId: string;
  studentName: string;
  ageBracket: 'kid' | 'older-kid';
}

export default function QuizPlayer({
  assessment,
  questions,
  studentId,
  studentName,
  ageBracket
}: QuizPlayerProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  
  // Quiz states
  const [userAnswers, setUserAnswers] = useState<{ [qId: string]: any }>({});
  const [visited, setVisited] = useState<{ [qId: string]: boolean }>({ [questions[0]?.id]: true });
  const [markedForReview, setMarkedForReview] = useState<{ [qId: string]: boolean }>({});
  
  // Timer states
  const totalSeconds = assessment.time_limit_mins * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [isFinished, setIsFinished] = useState(false);
  const [timeSpentSecs, setTimeSpentSecs] = useState(0);

  // Form submission handling
  const [state, formAction, isPending] = useActionState(submitAssessmentResponse, null);
  const formRef = useRef<HTMLFormElement>(null);

  // Start timer
  useEffect(() => {
    if (isFinished) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsFinished(true);
          // Auto-submit form on expire
          setTimeout(() => {
            formRef.current?.requestSubmit();
          }, 500);
          return 0;
        }
        setTimeSpentSecs(t => t + 1);
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isFinished]);

  const activeQuestion = questions[currentIdx];

  if (!activeQuestion) {
    return (
      <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
        <h3>No questions available in this assessment.</h3>
      </div>
    );
  }

  // Answer handler for MCQ Single
  const handleSelectSingle = (qId: string, value: string) => {
    setUserAnswers(prev => ({ ...prev, [qId]: value }));
  };

  // Answer handler for MCQ Multiple
  const handleSelectMultiple = (qId: string, value: string) => {
    const current = (userAnswers[qId] as string[]) || [];
    const next = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setUserAnswers(prev => ({ ...prev, [qId]: next }));
  };

  // Answer handler for Fill In
  const handleFillIn = (qId: string, text: string) => {
    setUserAnswers(prev => ({ ...prev, [qId]: text }));
  };

  const toggleMarkReview = (qId: string) => {
    setMarkedForReview(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setVisited(prev => ({ ...prev, [questions[nextIdx].id]: true }));
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const selectQuestion = (idx: number) => {
    setCurrentIdx(idx);
    setVisited(prev => ({ ...prev, [questions[idx].id]: true }));
  };

  // Check state of question
  const getQuestionState = (qId: string) => {
    const isMarked = markedForReview[qId];
    const isAns = userAnswers[qId] !== undefined && userAnswers[qId] !== '' && (!Array.isArray(userAnswers[qId]) || userAnswers[qId].length > 0);
    const isVis = visited[qId];

    if (isMarked) return 'marked';
    if (isAns) return 'answered';
    if (isVis) return 'visited';
    return 'unvisited';
  };

  // Formatted timer representation
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const timerPercent = (secondsLeft / totalSeconds) * 100;

  // Visual Theme adaptations
  const isKid = ageBracket === 'kid';
  const containerClass = isKid ? 'kid-theme' : 'older-kid-theme';

  return (
    <div className={containerClass} style={{ padding: '1rem', minHeight: '80vh' }}>
      
      {/* Quiz Top bar: Title + Timer */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-purple" style={{ marginBottom: '0.25rem' }}>Assessment Player</span>
          <h2 style={{ fontSize: isKid ? '2rem' : '1.5rem', margin: 0 }}>{assessment.title}</h2>
        </div>

        {/* Timer status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(0,0,0,0.3)', padding: '0.5rem 1rem', borderRadius: '9999px' }}>
          <Timer style={{ width: '20px', height: '20px', color: secondsLeft < 60 ? '#ef4444' : 'hsl(var(--accent-purple))' }} />
          <span style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'monospace', color: secondsLeft < 60 ? '#ef4444' : '#fff' }}>
            {formatTime(secondsLeft)}
          </span>
        </div>
      </div>

      {/* Timer Progress Indicator bar */}
      <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', marginBottom: '2rem', overflow: 'hidden' }}>
        <div style={{
          width: `${timerPercent}%`,
          height: '100%',
          background: secondsLeft < 60 ? '#ef4444' : 'linear-gradient(90deg, hsl(var(--accent-purple)), hsl(var(--accent-pink)))',
          transition: 'width 1s linear'
        }} />
      </div>

      {/* Main interactive grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }} className="quiz-layout-grid">
        
        {/* Left Side: Active Question Panel */}
        <div className="glass-card" style={{ padding: isKid ? '2.5rem' : '1.75rem', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          
          <div style={{ width: '100%' }}>
            
            {/* Header: Number, Points, Difficulty */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>
                Question {currentIdx + 1} of {questions.length}
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span className="badge" style={{
                  background: activeQuestion.difficulty === 'easy' ? 'rgba(16,185,129,0.15)' : activeQuestion.difficulty === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                  color: activeQuestion.difficulty === 'easy' ? '#34d399' : activeQuestion.difficulty === 'medium' ? '#f59e0b' : '#f87171',
                  border: '1px solid currentColor'
                }}>
                  {activeQuestion.difficulty}
                </span>
                <span className="badge badge-purple">{activeQuestion.points} Points</span>
              </div>
            </div>

            {/* Reading Comprehension passage split panel */}
            {activeQuestion.question_type === 'reading' && activeQuestion.passage_text && (
              <div style={{
                background: 'rgba(0,0,0,0.25)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                marginBottom: '1.5rem',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                maxHeight: '180px',
                overflowY: 'auto',
                borderLeft: '4px solid hsl(var(--accent-purple))'
              }}>
                <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'hsl(var(--accent-purple))' }}>📖 Reading Passage:</strong>
                {activeQuestion.passage_text}
              </div>
            )}

            {/* Question body text */}
            <h3 style={{ fontSize: isKid ? '1.5rem' : '1.25rem', fontWeight: 600, marginBottom: '1.5rem', lineHeight: 1.5 }}>
              {activeQuestion.question_text}
            </h3>

            {/* Answer Input controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              
              {/* MCQ Single / Reading type */}
              {(activeQuestion.question_type === 'mcq_single' || activeQuestion.question_type === 'reading') && (
                (activeQuestion.options || []).map((opt, i) => {
                  const isSelected = userAnswers[activeQuestion.id] === opt;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelectSingle(activeQuestion.id, opt)}
                      style={{
                        textAlign: 'left',
                        padding: '1rem 1.25rem',
                        borderRadius: 'var(--radius-md)',
                        background: isSelected ? 'hsla(var(--accent-purple), 0.15)' : 'rgba(255,255,255,0.02)',
                        border: isSelected ? '2px solid hsl(var(--accent-purple))' : '1px solid hsl(var(--border-soft))',
                        color: isSelected ? '#fff' : 'hsl(var(--text-secondary))',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        transition: 'all 0.15s ease',
                        fontWeight: isSelected ? 600 : 500
                      }}
                    >
                      {opt}
                    </button>
                  );
                })
              )}

              {/* MCQ Multiple */}
              {activeQuestion.question_type === 'mcq_multiple' && (
                (activeQuestion.options || []).map((opt, i) => {
                  const isSelected = ((userAnswers[activeQuestion.id] as string[]) || []).includes(opt);
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelectMultiple(activeQuestion.id, opt)}
                      style={{
                        textAlign: 'left',
                        padding: '1rem 1.25rem',
                        borderRadius: 'var(--radius-md)',
                        background: isSelected ? 'hsla(var(--accent-pink), 0.15)' : 'rgba(255,255,255,0.02)',
                        border: isSelected ? '2px solid hsl(var(--accent-pink))' : '1px solid hsl(var(--border-soft))',
                        color: isSelected ? '#fff' : 'hsl(var(--text-secondary))',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        transition: 'all 0.15s ease',
                        fontWeight: isSelected ? 600 : 500
                      }}
                    >
                      <input 
                        type="checkbox" 
                        checked={isSelected} 
                        readOnly 
                        style={{ marginRight: '0.75rem', accentColor: 'hsl(var(--accent-pink))' }} 
                      />
                      {opt}
                    </button>
                  );
                })
              )}

              {/* Fill In the Blank */}
              {activeQuestion.question_type === 'fill_in' && (
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type your answer here..."
                  value={userAnswers[activeQuestion.id] || ''}
                  onChange={(e) => handleFillIn(activeQuestion.id, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    fontSize: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: userAnswers[activeQuestion.id] ? '2px solid hsl(var(--accent-cyan))' : '1px solid hsl(var(--border-soft))'
                  }}
                />
              )}

            </div>
          </div>

          {/* Navigation and Action footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="btn-secondary"
                style={{ padding: '0.6rem 1rem' }}
              >
                <ChevronLeft style={{ width: '18px', height: '18px' }} /> Back
              </button>
              <button
                onClick={handleNext}
                disabled={currentIdx === questions.length - 1}
                className="btn-secondary"
                style={{ padding: '0.6rem 1rem' }}
              >
                Next <ChevronRight style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <button
              onClick={() => toggleMarkReview(activeQuestion.id)}
              className="btn-secondary"
              style={{
                borderColor: markedForReview[activeQuestion.id] ? 'hsl(var(--accent-purple))' : 'inherit',
                color: markedForReview[activeQuestion.id] ? 'hsl(var(--accent-purple))' : 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.6rem 1rem'
              }}
            >
              <Bookmark style={{ width: '16px', height: '16px', fill: markedForReview[activeQuestion.id] ? 'currentColor' : 'none' }} />
              {markedForReview[activeQuestion.id] ? 'Marked for Review' : 'Mark for Review'}
            </button>
          </div>

        </div>

        {/* Right Side: Navigation Grid & Submission Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Question Grid Box */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'hsl(var(--text-secondary))' }}>
              Question Grid
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.65rem',
              marginBottom: '1.25rem'
            }}>
              {questions.map((q, idx) => {
                const qState = getQuestionState(q.id);
                const isActive = idx === currentIdx;

                let borderStyle = '1px solid hsl(var(--border-soft))';
                let bgStyle = 'transparent';
                let textStyle = 'hsl(var(--text-secondary))';

                if (qState === 'marked') {
                  bgStyle = 'rgba(139, 92, 246, 0.15)';
                  borderStyle = '1px solid hsl(var(--accent-purple))';
                  textStyle = '#a78bfa';
                } else if (qState === 'answered') {
                  bgStyle = 'rgba(16, 185, 129, 0.15)';
                  borderStyle = '1px solid #10b981';
                  textStyle = '#34d399';
                } else if (qState === 'visited') {
                  bgStyle = 'rgba(255, 255, 255, 0.03)';
                  borderStyle = '1px solid rgba(255,255,255,0.2)';
                  textStyle = '#fff';
                }

                if (isActive) {
                  borderStyle = '2.5px solid hsl(var(--accent-cyan))';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => selectQuestion(idx)}
                    style={{
                      height: '42px',
                      borderRadius: 'var(--radius-sm)',
                      background: bgStyle,
                      border: borderStyle,
                      color: textStyle,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Grid legend labels */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.75rem', color: 'hsl(var(--text-muted))', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981' }} />
                <span>Answered</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(139, 92, 246, 0.15)', border: '1px solid hsl(var(--accent-purple))' }} />
                <span>Marked for Review</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255,255,255,0.2)' }} />
                <span>Visited</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', border: '1px solid hsl(var(--border-soft))' }} />
                <span>Unvisited</span>
              </div>
            </div>
          </div>

          {/* Submission confirmation Box */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Finish Quiz</h3>
            <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', marginBottom: '1.25rem' }}>
              Once you submit, your score and earned XP will be recorded immediately.
            </p>

            <form ref={formRef} action={formAction}>
              <input type="hidden" name="studentId" value={studentId} />
              <input type="hidden" name="assessmentId" value={assessment.id} />
              <input type="hidden" name="timeSpentSecs" value={timeSpentSecs} />
              <input type="hidden" name="responses" value={JSON.stringify(userAnswers)} />

              {state && state.success && (
                <div style={{
                  padding: '0.75rem', borderRadius: 'var(--radius-md)',
                  background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                  color: '#34d399', fontSize: '0.85rem', marginBottom: '1rem',
                  display: 'flex', flexDirection: 'column', gap: '0.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                    <CheckCircle style={{ width: '16px', height: '16px' }} />
                    Submission Recorded!
                  </div>
                  <div>{state.message}</div>
                  <Link href={`/student/dashboard?studentId=${studentId}`} className="btn-premium" style={{ fontSize: '0.8rem', padding: '0.4rem', textShadow: 'none', textAlign: 'center', width: '100%', display: 'block' }}>
                    Go to Dashboard
                  </Link>
                </div>
              )}

              {state && !state.success && (
                <div style={{
                  padding: '0.75rem', borderRadius: 'var(--radius-md)',
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                  color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem'
                }}>
                  {state.error}
                </div>
              )}

              <button
                type="submit"
                disabled={isPending || (state?.success === true)}
                className="btn-premium"
                style={{ width: '100%', gap: '0.5rem', justifyContent: 'center' }}
              >
                <Send style={{ width: '16px', height: '16px' }} />
                {isPending ? 'Submitting...' : 'Submit Answers'}
              </button>
            </form>
          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .quiz-layout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
}
