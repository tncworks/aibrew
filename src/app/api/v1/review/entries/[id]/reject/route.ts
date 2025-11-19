import { NextRequest, NextResponse } from 'next/server';
import { rejectCandidate } from '@/services/review_queue.js';
import { enqueueRetry } from '@/services/quality_gate/retry_queue.js';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json();
  const reviewerId = 'system';
  await rejectCandidate(params.id, reviewerId, body?.comment ?? '');
  await enqueueRetry(params.id);
  return NextResponse.json({ status: 'rejected' });
}
