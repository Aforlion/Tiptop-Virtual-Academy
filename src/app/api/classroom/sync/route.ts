import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mimic fetching coursework from Google Classroom API
    const syncedItems = [
      { id: 'gc-001', title: 'Maths Key Stage 2 Algebra Homework', status: 'synchronized' },
      { id: 'gc-002', title: 'Science Key Stage 2 Gravity Quiz', status: 'synchronized' },
    ];

    return NextResponse.json({
      success: true,
      message: 'Google Classroom coursework synchronized successfully.',
      items: syncedItems,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
