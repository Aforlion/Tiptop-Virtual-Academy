'use client';

import React from 'react';

interface CertificatePreviewProps {
  titleText: string;
  bodyText: string;
  signatoryName: string;
  signatoryTitle: string;
  accentColor: string;
  studentName: string;
  courseTitle: string;
  issueDate?: string;
  showPrintButton?: boolean;
}

export default function CertificatePreview({
  titleText,
  bodyText,
  signatoryName,
  signatoryTitle,
  accentColor,
  studentName,
  courseTitle,
  issueDate,
  showPrintButton = true,
}: CertificatePreviewProps) {
  const resolvedBody = bodyText
    .replace(/\{student_name\}/g, studentName)
    .replace(/\{course_title\}/g, courseTitle);

  const date = issueDate
    ? new Date(issueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  const handlePrint = () => window.print();

  return (
    <>
      {/* Print-only global overrides */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #certificate-printable,
          #certificate-printable * { visibility: visible !important; }
          #certificate-printable {
            position: fixed !important;
            inset: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: #fff !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 0 !important;
            margin: 0 !important;
            z-index: 9999 !important;
          }
          .cert-no-print { display: none !important; }
        }
      `}</style>

      {showPrintButton && (
        <div className="cert-no-print" style={{ textAlign: 'right', marginBottom: '1.25rem' }}>
          <button onClick={handlePrint} className="btn-premium" style={{ gap: '0.5rem' }}>
            🖨️ Download / Print Certificate
          </button>
        </div>
      )}

      {/* Certificate Canvas */}
      <div id="certificate-printable" style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: '820px',
          minHeight: '560px',
          background: '#fff',
          borderRadius: '16px',
          border: `8px solid ${accentColor}`,
          boxShadow: `0 0 0 4px ${accentColor}22, 0 20px 60px rgba(0,0,0,0.25)`,
          padding: '56px 72px',
          position: 'relative',
          fontFamily: 'Georgia, "Times New Roman", serif',
          color: '#1a1a2e',
          overflow: 'hidden',
        }}>
          {/* Corner decorations */}
          {[
            { top: 12, left: 12 },
            { top: 12, right: 12 },
            { bottom: 12, left: 12 },
            { bottom: 12, right: 12 },
          ].map((pos, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: '40px',
              height: '40px',
              borderColor: `${accentColor}88`,
              borderStyle: 'solid',
              borderWidth: i < 2
                ? (i === 0 ? '3px 0 0 3px' : '3px 3px 0 0')
                : (i === 2 ? '0 0 3px 3px' : '0 3px 3px 0'),
              borderRadius: i === 0 ? '8px 0 0 0' : i === 1 ? '0 8px 0 0' : i === 2 ? '0 0 0 8px' : '0 0 8px 0',
              ...pos,
            }} />
          ))}

          {/* Academy Logo / Seal */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: `${accentColor}18`,
              border: `3px solid ${accentColor}44`,
              fontSize: '2rem',
            }}>🎓</div>
          </div>

          {/* Title */}
          <h1 style={{
            textAlign: 'center',
            fontSize: '2.2rem',
            fontWeight: 700,
            color: accentColor,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: '6px',
          }}>{titleText}</h1>

          {/* Sub-title line */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span style={{
              display: 'inline-block',
              width: '200px',
              height: '2px',
              background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
            }} />
          </div>

          {/* Body text */}
          <p style={{
            textAlign: 'center',
            fontSize: '1.05rem',
            lineHeight: 1.8,
            color: '#374151',
            maxWidth: '580px',
            margin: '0 auto 32px',
          }}>{resolvedBody}</p>

          {/* Issue Date */}
          <p style={{
            textAlign: 'center',
            fontSize: '0.9rem',
            color: '#6b7280',
            marginBottom: '48px',
            fontStyle: 'italic',
          }}>Issued on {date}</p>

          {/* Signature line */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            gap: '80px',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '180px',
                borderBottom: `2px solid ${accentColor}66`,
                marginBottom: '8px',
                height: '36px',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                paddingBottom: '6px',
              }}>
                <span style={{ fontStyle: 'italic', fontSize: '1.1rem', color: accentColor }}>
                  {signatoryName}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>{signatoryName}</p>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>{signatoryTitle}</p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                border: `3px solid ${accentColor}44`,
                background: `${accentColor}0d`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                marginBottom: '4px',
              }}>🏅</div>
              <p style={{ fontSize: '0.7rem', color: '#9ca3af', margin: 0 }}>Official Seal</p>
            </div>
          </div>

          {/* Tiptop Academy footer */}
          <p style={{
            position: 'absolute',
            bottom: '18px',
            left: 0,
            right: 0,
            textAlign: 'center',
            fontSize: '0.7rem',
            color: '#d1d5db',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}>
            Tiptop Virtual Academy · Inspiring Young Minds
          </p>
        </div>
      </div>
    </>
  );
}
