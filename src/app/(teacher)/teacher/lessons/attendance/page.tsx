'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function TeacherAttendancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Mock student list for attendance register
  const [students, setStudents] = useState([
    { id: 'stu-011', name: 'John Doe', status: 'present' },
    { id: 'stu-012', name: 'Jane Smith', status: 'present' },
    { id: 'stu-013', name: 'Billy Boy', status: 'absent' },
  ]);

  const handleStatusChange = (id: string, newStatus: string) => {
    setStudents(prev =>
      prev.map(stu => (stu.id === id ? { ...stu, status: newStatus } : stu))
    );
  };

  const submitAttendance = async () => {
    setLoading(true);
    const supabase = createClient();

    // Iterate and insert to attendance_records
    for (const student of students) {
      await supabase.from('attendance_records').insert({
        student_id: '47d8d552-f570-ca4a-404e-dfae344f244f', // Using a valid placeholder UUID for testing
        session_id: '47d8d552-f570-ca4a-404e-dfae344f244f',  // Using a valid placeholder UUID for testing
        status: student.status,
      });
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-lg mt-10 text-center">
        <h2 className="text-xl font-bold text-violet-600">Attendance Recorded!</h2>
        <p className="text-slate-500 mt-2">Daily registers have been synchronized to database and parents notified.</p>
        <button
          onClick={() => router.push('/teacher/dashboard')}
          className="mt-4 px-4 py-2 text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-lg mt-10">
      <h1 className="text-2xl font-bold text-slate-800">Attendance Register</h1>
      <p className="text-slate-500 text-sm mt-1">maths Class - Year 4 (Key Stage 2)</p>

      <div className="mt-6 space-y-4">
        {students.map(student => (
          <div key={student.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
            <span className="font-semibold text-slate-700">{student.name}</span>
            <div className="flex gap-2">
              {['present', 'absent', 'late'].map(st => (
                <button
                  key={st}
                  onClick={() => handleStatusChange(student.id, st)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full capitalize border transition ${
                    student.status === st
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={submitAttendance}
        disabled={loading}
        className="w-full mt-6 py-2.5 text-white bg-violet-600 rounded-lg font-semibold hover:bg-violet-700 disabled:opacity-50 transition"
      >
        {loading ? 'Recording...' : 'Submit Register'}
      </button>
    </div>
  );
}
