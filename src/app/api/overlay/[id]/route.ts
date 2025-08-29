import { overlayService } from '@/db';

export async function GET(context: { params: Promise<{ id: string }> }) {
  const params = await context.params;

  const overlay = await overlayService.getOverlay(params.id);

  if (!overlay) {
    return Response.json({ error: 'Overlay introuvable' }, { status: 404 });
  }

  return Response.json(overlay.data);
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const newData = await request.json();

  const success = await overlayService.updateOverlay(params.id, newData);

  if (!success) {
    return Response.json({ error: 'Overlay introuvable ou expiré' }, { status: 404 });
  }

  return Response.json({ success: true });
}

export async function DELETE(context: { params: Promise<{ id: string }> }) {
  const params = await context.params;

  const success = await overlayService.deleteOverlay(params.id);

  if (!success) {
    return Response.json({ error: 'Overlay introuvable' }, { status: 404 });
  }

  return Response.json({ success: true });
}
