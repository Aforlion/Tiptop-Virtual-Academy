'use client';

import React, { useState, useActionState, useEffect } from 'react';
import { saveCertificateTemplate } from '@/app/admin/actions';
import { Course, CertificateTemplate } from '@/lib/types';
import CertificatePreview from './CertificatePreview';
import { Palette, Save, CheckCircle, AlertCircle } from 'lucide-react';

interface CertificateDesignerProps {
  courses: Course[];
  templates: CertificateTemplate[];
}

const ACCENT_PRESETS = [
  '#7c3aed', '#db2777', '#2563eb', '#059669', '#d97706', '#dc2626',
];

export default function CertificateDesigner({ courses, templates }: CertificateDesignerProps) {
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id ?? '');
  const [titleText, setTitleText]       = useState('Certificate of Completion');
  const [bodyText, setBodyText]         = useState('This certifies that {student_name} has successfully completed {course_title} at Tiptop Virtual Academy with distinction.');
  const [signatoryName, setSignatoryName]   = useState('Barbara Johnson');
  const [signatoryTitle, setSignatoryTitle] = useState('Academy Director');
  const [accentColor, setAccentColor]   = useState('#7c3aed');

  const [state, formAction, isPending] = useActionState(saveCertificateTemplate, null);

  // When course changes, load existing template if available
  useEffect(() => {
    const tpl = templates.find(t => t.course_id === selectedCourseId);
    if (tpl) {
      setTitleText(tpl.title_text);
      setBodyText(tpl.body_text);
      setSignatoryName(tpl.signatory_name);
      setSignatoryTitle(tpl.signatory_title);
      setAccentColor(tpl.accent_color);
    } else {
      setTitleText('Certificate of Completion');
      setBodyText('This certifies that {student_name} has successfully completed {course_title} at Tiptop Virtual Academy with distinction.');
      setSignatoryName('Barbara Johnson');
      setSignatoryTitle('Academy Director');
      setAccentColor('#7c3aed');
    }
  }, [selectedCourseId, templates]);

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '2rem', alignItems: 'start' }}>
      {/* ── LEFT: Editor Panel ── */}
      <div className="glass-card" style={{ position: 'sticky', top: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, hsl(var(--accent-purple)), hsl(var(--accent-pink)))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Palette style={{ width: '18px', height: '18px', color: '#fff' }} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Template Editor</h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>Live preview updates instantly</p>
          </div>
        </div>

        <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <input type="hidden" name="courseId" value={selectedCourseId} />

          {/* Course selector */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Course</label>
            <select
              className="form-select"
              value={selectedCourseId}
              onChange={e => setSelectedCourseId(e.target.value)}
              style={{ width: '100%' }}
            >
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Certificate Title</label>
            <input
              className="form-input"
              name="titleText"
              value={titleText}
              onChange={e => setTitleText(e.target.value)}
              placeholder="Certificate of Completion"
              style={{ width: '100%' }}
            />
          </div>

          {/* Body */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              Body Text
              <span style={{ marginLeft: '0.5rem', color: 'hsl(var(--accent-cyan))', fontSize: '0.72rem' }}>
                Use {'{student_name}'} &amp; {'{course_title}'}
              </span>
            </label>
            <textarea
              className="form-input"
              name="bodyText"
              value={bodyText}
              onChange={e => setBodyText(e.target.value)}
              rows={4}
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          {/* Signatory */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Signatory Name</label>
              <input
                className="form-input"
                name="signatoryName"
                value={signatoryName}
                onChange={e => setSignatoryName(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Signatory Title</label>
              <input
                className="form-input"
                name="signatoryTitle"
                value={signatoryTitle}
                onChange={e => setSignatoryTitle(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Accent color */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Accent Colour</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {ACCENT_PRESETS.map(hex => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setAccentColor(hex)}
                  style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: hex, border: accentColor === hex ? '3px solid #fff' : '2px solid transparent',
                    cursor: 'pointer', boxShadow: accentColor === hex ? `0 0 0 3px ${hex}88` : 'none',
                    transition: 'all 0.2s',
                  }}
                />
              ))}
              <input
                type="color"
                name="accentColor"
                value={accentColor}
                onChange={e => setAccentColor(e.target.value)}
                style={{ width: '36px', height: '28px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: 'none' }}
              />
            </div>
          </div>

          {/* State feedback */}
          {state && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.75rem', borderRadius: 'var(--radius-md)',
              background: state.success ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${state.success ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
              color: state.success ? '#34d399' : '#f87171',
              fontSize: '0.875rem',
            }}>
              {state.success
                ? <CheckCircle style={{ width: '16px', height: '16px' }} />
                : <AlertCircle style={{ width: '16px', height: '16px' }} />
              }
              {state.success ? state.message : state.error}
            </div>
          )}

          <button type="submit" className="btn-premium" disabled={isPending} style={{ width: '100%', justifyContent: 'center' }}>
            <Save style={{ width: '16px', height: '16px' }} />
            {isPending ? 'Saving…' : 'Save Template'}
          </button>
        </form>
      </div>

      {/* ── RIGHT: Live Preview ── */}
      <div>
        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0 }}>Live Preview</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>
              Showing sample with a real student name
            </p>
          </div>
          {templates.find(t => t.course_id === selectedCourseId) && (
            <span className="badge badge-green">Template Saved</span>
          )}
        </div>
        <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-lg)' }}>
          <CertificatePreview
            titleText={titleText}
            bodyText={bodyText}
            signatoryName={signatoryName}
            signatoryTitle={signatoryTitle}
            accentColor={accentColor}
            studentName="Amara Osei-Bonsu"
            courseTitle={selectedCourse?.title ?? 'Creative Coding Foundations'}
            showPrintButton
          />
        </div>
      </div>
    </div>
  );
}
