import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, startTime, endTime } = body;

    if (!title || !startTime || !endTime) {
      return NextResponse.json({ success: false, error: 'Missing required parameters.' }, { status: 400 });
    }

    // Mock Google Calendar event creation response with Google Meet URL
    const meetLink = `https://meet.google.com/tva-mock-${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}`;

    return NextResponse.json({
      success: true,
      event_id: `gcal-${Math.random().toString(36).substring(2, 9)}`,
      meet_link: meetLink,
      message: 'Google Calendar event created successfully with Google Meet link.',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
