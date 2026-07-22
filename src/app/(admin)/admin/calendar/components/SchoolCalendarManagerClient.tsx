'use client';

import React, { useState, useActionState } from 'react';
import { createCalendarEvent } from '@/app/admin/actions';
import { Calendar, Plus, CheckCircle2, RefreshCw, Clock, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  initialEvents: any[];
}

export default function SchoolCalendarManagerClient({ initialEvents }: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const eventDate = formData.get('eventDate') as string;
      const eventType = formData.get('eventType') as any;
      const syncToGoogle = formData.get('syncToGoogle') === 'true';

      const res = await createCalendarEvent(title, description, eventDate, eventType, syncToGoogle);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>
          Scheduled School Events & Academic Terms ({initialEvents.length})
        </h3>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-premium"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #e81cff 0%, #7c3aed 100%)' }}
          >
            <Plus style={{ width: '18px', height: '18px' }} /> Schedule School Event
          </button>
        )}
      </div>

      {showForm && (
        <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1.2rem', color: '#fff' }}>Add School Calendar Event</h4>
            <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}>
              <X style={{ width: '20px', height: '20px' }} />
            </button>
          </div>

          <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', display: 'block', marginBottom: '0.35rem' }}>Event Category</label>
                <select name="eventType" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                  <option value="academic_term" style={{ background: '#0d0d12' }}>Academic Term / Semester Start</option>
                  <option value="holiday" style={{ background: '#0d0d12' }}>School Holiday / Public Break</option>
                  <option value="exam_window" style={{ background: '#0d0d12' }}>Examination Window</option>
                  <option value="parent_meeting" style={{ background: '#0d0d12' }}>Parent-Teacher Conference</option>
                  <option value="staff_meeting" style={{ background: '#0d0d12' }}>Staff Development Day</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', display: 'block', marginBottom: '0.35rem' }}>Event Title</label>
                <input name="title" type="text" required placeholder="e.g. Autumn Term Opening Assembly" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', display: 'block', marginBottom: '0.35rem' }}>Date</label>
                <input name="eventDate" type="date" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', display: 'block', marginBottom: '0.35rem' }}>Description & Agenda Notes</label>
              <textarea name="description" rows={3} placeholder="Details regarding instructions, attendance, or logistics..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontFamily: 'inherit' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" id="syncToGoogle" name="syncToGoogle" value="true" defaultChecked />
              <label htmlFor="syncToGoogle" style={{ fontSize: '0.85rem', color: '#fff', cursor: 'pointer' }}>
                Automatically sync with Google Calendar & broadcast to Parent/Teacher Feeds
              </label>
            </div>

            {state && !state.success && <div style={{ color: '#ef4444', fontSize: '0.85rem' }}>{state.error}</div>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={isPending} className="btn-premium" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #e81cff 0%, #7c3aed 100%)' }}>
                {isPending ? <Loader2 className="animate-spin" style={{ width: '16px', height: '16px' }} /> : 'Save & Sync Event'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events List */}
      {initialEvents.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>
          No custom school calendar events scheduled yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {initialEvents.map(e => (
            <div key={e.id} className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span className="badge badge-purple" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>School Event</span>
                <h4 style={{ margin: '0.25rem 0 0 0', fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>{e.title}</h4>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>{e.body}</p>
              </div>
              <span className="badge badge-green" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <CheckCircle2 style={{ width: '12px', height: '12px' }} /> Google Calendar Synced
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
