import { NextResponse } from 'next/server';
import { calculateInstitutionalKPIs } from '@/lib/kpi-engine';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const kpis = await calculateInstitutionalKPIs();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      institution: 'Tiptop Virtual Academy',
      data: kpis,
      ai_extension_hooks: {
        copilot_ready: true,
        risk_prediction_model: 'v2.1',
        revenue_forecasting_model: 'v1.4'
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to calculate analytics KPIs' },
      { status: 500 }
    );
  }
}
