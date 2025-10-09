import { OverlayService } from '@/lib/overlayService';
import { logger } from '@/utils/logger';

const log = logger.child('api:overlay');

export async function POST(request: Request) {
  try {
    const config = await request.json();

    const overlayId = OverlayService.createOverlay(config);

    return Response.json({ overlayId });
  } catch (error) {
    log.error('Error creating overlay:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
