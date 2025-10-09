import { OverlayService } from '@/lib/overlayService';
import { logger } from '@/utils/logger';

const log = logger.child('api:overlay');

export const dynamic = 'force-dynamic';

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;

    if (!params?.id) {
      return Response.json({ error: "ID de l'overlay manquant" }, { status: 400 });
    }

    const overlay = OverlayService.getOverlay(params.id);

    if (!overlay) {
      return Response.json({ error: 'Overlay introuvable' }, { status: 404 });
    }

    return Response.json(overlay.data);
  } catch (error) {
    log.error('Error in GET /api/overlay/[id]:', error);
    return Response.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;

    if (!params?.id) {
      return Response.json({ error: "ID de l'overlay manquant" }, { status: 400 });
    }

    const newData = await request.json();

    const success = OverlayService.updateOverlay(params.id, newData);

    if (!success) {
      return Response.json({ error: 'Overlay introuvable ou expiré' }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    log.error('Error in PUT /api/overlay/[id]:', error);
    return Response.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;

    if (!params?.id) {
      return Response.json({ error: "ID de l'overlay manquant" }, { status: 400 });
    }

    const success = OverlayService.deleteOverlay(params.id);

    if (!success) {
      return Response.json({ error: 'Overlay introuvable' }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    log.error('Error in DELETE /api/overlay/[id]:', error);
    return Response.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
