'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function StudentAssignmentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fileUrl, setFileUrl] = useState('');

  const submitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.from('student_submissions').insert({
      assignment_id: '47d8d552-f570-ca4a-404e-dfae344f244f', // Using a valid placeholder UUID for testing
      student_id: '47d8d552-f570-ca4a-404e-dfae344f244f',    // Using a valid placeholder UUID for testing
      file_url: fileUrl || 'http://example.com/homework.pdf',
    });

    if (error) {
      alert(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-lg mt-10 text-center">
        <h2 className="text-xl font-bold text-violet-600">Homework Submitted!</h2>
        <p className="text-slate-500 mt-2">Your assignment has been sent to your teacher for review.</p>
        <button
          onClick={() => router.push('/student/dashboard')}
          className="mt-4 px-4 py-2 text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-lg mt-10">
      <h1 className="text-2xl font-bold text-slate-800 font-display">My Homework board</h1>
      <p className="text-slate-500 text-sm mt-1">Submit your completed files here.</p>

      <form onSubmit={submitAssignment} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Assignment ID: Algebra Key Stage 2</label>
          <input
            type="text"
            required
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            placeholder="Paste your Google Drive or document URL here"
            className="w-full px-3 py-2 mt-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 text-white bg-violet-600 rounded-lg font-semibold hover:bg-violet-700 disabled:opacity-50 transition"
        >
          {loading ? 'Submitting...' : 'Upload & Submit'}
        </button>
      </form>
    </div>
  );
}
