import { OverlayService } from '@/lib/overlayService';

export const dynamic = 'force-dynamic';

export async function POST(_: Request) {
  try {
    const cleanedCount = OverlayService.cleanupExpired();
    const stats = OverlayService.getStats();

    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Manual cleanup: Removed ${cleanedCount} expired overlays`);

    return Response.json({
      success: true,
      cleanedCount,
      stats,
      timestamp,
    });
  } catch (error) {
    console.error('Error in manual cleanup:', error);
    return Response.json(
      {
        success: false,
        error: 'Cleanup failed',
      },
      { status: 500 },
    );
  }
}
