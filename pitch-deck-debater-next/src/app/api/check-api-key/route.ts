import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  return NextResponse.json({
    loaded: !!apiKey,
  });
}
