import { getCurrentMatchByGameNameAndTagLine } from '@/lib/matchApi';
import { MatchApiError } from '@/types/MatchApiError';
import { logger } from '@/utils/logger';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const log = logger.child('api:match:current');

  const searchParams = request.nextUrl.searchParams;
  const gameName = searchParams.get('gameName')?.trim();
  const tagLine = searchParams.get('tagLine')?.trim();

  if (!gameName || !tagLine) {
    return NextResponse.json(
      { error: 'Missing required parameters: gameName and tagLine' },
      { status: 400 },
    );
  }
  // tagLine is typically 3-5 alphanumeric
  if (!/^[a-zA-Z0-9]{3,5}$/.test(tagLine)) {
    return NextResponse.json({ error: 'Invalid tagLine format' }, { status: 400 });
  }

  try {
    const participants = await getCurrentMatchByGameNameAndTagLine(gameName, tagLine);
    return NextResponse.json({ participants });
  } catch (error: unknown) {
    // Handle custom MatchApiError with proper status codes
    if (error instanceof MatchApiError) {
      log.error(`Unexpected error fetching match data: ${error.statusCode} ${error.message}`);
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    // Fallback for unexpected errors
    log.error(`Unexpected error fetching match data: ${error}`);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
