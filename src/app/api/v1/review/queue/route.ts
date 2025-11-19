import { NextRequest, NextResponse } from 'next/server';
import { listPendingCandidates } from '@/services/review_queue.js';

export async function GET(_req: NextRequest) {
  // TODO: Firebase Auth JWT 検証を追加
  const candidates = await listPendingCandidates();
  return NextResponse.json({ items: candidates });
}
