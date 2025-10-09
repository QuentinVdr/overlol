import { OverlayService } from '@/lib/overlayService';

export async function POST(request: Request) {
  try {
    const config = await request.json();

    const overlayId = OverlayService.createOverlay(config);

    return Response.json({ overlayId });
  } catch (error) {
    console.error('Error creating overlay:', error);
    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
