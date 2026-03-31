import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Bot command handling is now done by the Rust chocosfera-bot process (long-polling).
// This webhook endpoint is no longer needed.

export async function POST() {
  return NextResponse.json({ ok: true, note: 'Bot handled by chocosfera-bot (Rust)' });
}

export async function GET() {
  return NextResponse.json({ status: 'disabled', note: 'Bot handled by chocosfera-bot (Rust)' });
}
