/**
 * Next.js Instrumentation Hook
 * This file runs once when the Next.js server starts
 * Perfect for initializing background services like schedulers
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Only run on Node.js runtime (not Edge)
    try {
      const { startScheduler } = await import('./lib/scheduler');
      startScheduler();
    } catch (error) {
      console.error('Failed to initialize scheduler:', error);
    }
  }
}
