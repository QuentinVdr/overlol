import { OverlayService } from '@/lib/overlayService';
import { logger } from '@/utils/logger';

const log = logger.child('api:overlay');

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;

    if (!params?.id) {
      return Response.json({ error: 'Overlay id is missing' }, { status: 400 });
    }

    const overlay = OverlayService.getOverlay(params.id);

    if (!overlay) {
      return Response.json({ error: 'Overlay not found or expired' }, { status: 404 });
    }

    return Response.json(overlay.data);
  } catch (error) {
    log.error('Error in GET /api/overlay/[id]:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;

    if (!params?.id) {
      return Response.json({ error: 'Overlay id is missing' }, { status: 400 });
    }

    const newData = await request.json();

    const success = OverlayService.updateOverlay(params.id, newData);

    if (!success) {
      return Response.json({ error: 'Overlay not found or expired' }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    log.error('Error in PUT /api/overlay/[id]:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;

    if (!params?.id) {
      return Response.json({ error: 'Overlay id is missing' }, { status: 400 });
    }

    const success = OverlayService.deleteOverlay(params.id);

    if (!success) {
      return Response.json({ error: 'Overlay not found or expired' }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    log.error('Error in DELETE /api/overlay/[id]:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
