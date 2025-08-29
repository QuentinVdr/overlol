import { overlayService } from '@/db';

export async function POST(_: Request) {
  try {
    const cleanedCount = await overlayService.cleanupExpired();
    const stats = await overlayService.getStats();

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
