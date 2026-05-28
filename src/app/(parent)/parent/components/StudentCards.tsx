import React from 'react';
import Link from 'next/link';
import { Users, Play } from 'lucide-react';
import { Student } from '@/lib/types';
import { calculateAge } from '@/lib/utils';

interface StudentCardsProps {
  students: Student[];
}

export default function StudentCards({ students }: StudentCardsProps) {
  return (
    <div className="glass-card" style={{ marginBottom: '2.5rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.25rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Users style={{ width: '24px', height: '24px', color: 'hsl(var(--accent-pink))' }} /> Active Student Profiles
      </h2>

      {students.length === 0 ? (
        <div style={{ color: 'hsl(var(--text-muted))', textAlign: 'center', padding: '2rem' }}>
          No student profiles registered yet. Add your child profile using the form above!
        </div>
      ) : (
        <div className="grid-2">
          {students.map((kid) => {
            const age = calculateAge(kid.date_of_birth);
            const bracket = age <= 6 ? 'Junior (Ages 3-6)' : 'Senior (Ages 7-12)';

            return (
              <div key={kid.id} className="glass-card" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid hsl(var(--border-soft))' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>{kid.first_name}</h3>
                    <span className="badge badge-purple" style={{ fontSize: '0.65rem', marginTop: '0.25rem' }}>
                      {bracket}
                    </span>
                  </div>
                  <span className="badge badge-blue" style={{ textTransform: 'none' }}>
                    Age: {age} Years
                  </span>
                </div>

                {kid.notes && (
                  <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.85rem', marginBottom: '1.5rem', fontStyle: 'italic' }}>
                    &ldquo;{kid.notes}&rdquo;
                  </p>
                )}

                {/* One-Click Student Portal Switcher */}
                <Link 
                  href={`/student/dashboard?studentId=${kid.id}`}
                  className="btn-premium" 
                  style={{ 
                    width: '100%', 
                    padding: '0.6rem 1rem', 
                    fontSize: '0.9rem', 
                    background: age <= 6 ? 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)' : 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', 
                    boxShadow: 'none' 
                  }}
                >
                  Launch Learner Portal <Play style={{ width: '14px', height: '14px', fill: 'white' }} />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
