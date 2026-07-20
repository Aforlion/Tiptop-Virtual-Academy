import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profileId, title, body: msgBody } = body;

    if (!profileId || !title || !msgBody) {
      return NextResponse.json({ success: false, error: 'Missing parameters.' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase.from('notifications').insert({
      profile_id: profileId,
      title,
      body: msgBody,
      read: false,
    });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Notification dispatched and queued successfully.',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
