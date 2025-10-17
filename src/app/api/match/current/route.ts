import { getCurrentMatchByGameNameAndTagLine } from '@/lib/matchApi';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const gameName = searchParams.get('gameName')?.trim();
  const tagLine = searchParams.get('tagLine')?.trim();

  if (!gameName || !tagLine) {
    return NextResponse.json(
      { error: 'Missing required parameters: gameName and tagLine' },
      { status: 400 },
    );
  }

  try {
    const participants = await getCurrentMatchByGameNameAndTagLine(gameName, tagLine);
    return NextResponse.json({ participants });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch match data';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
