import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const preferredRegion = 'fra1';

export function GET() {
  return NextResponse.json({
    status: 'ok',
    region: process.env.VERCEL_REGION ?? 'local',
    timestamp: new Date().toISOString(),
  });
}
