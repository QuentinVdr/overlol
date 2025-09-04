import { overlayService } from '@/db';

export async function GET() {
  try {
    const stats = await overlayService.getStats();

    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      activeOverlays: stats.active,
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return Response.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Database connection failed',
      },
      { status: 503 },
    );
  }
}
