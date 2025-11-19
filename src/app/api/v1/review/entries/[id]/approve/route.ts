import { NextRequest, NextResponse } from 'next/server';
import { approveCandidate } from '@/services/review_queue';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json();
  const reviewerId = 'system'; // TODO: Authから取得
  await approveCandidate(params.id, reviewerId, body?.notes);
  return NextResponse.json({ status: 'approved' });
}
