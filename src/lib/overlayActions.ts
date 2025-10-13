'use server';

import { OverlayService } from '@/lib/overlayService';
import { TOverlay } from '@/types/OverlayType';
import { logger } from '@/utils/logger';
import { revalidatePath } from 'next/cache';

const log = logger.child('server-actions:overlay');

export type ActionResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Server action to create a new overlay
 */
export async function createOverlay(
  overlayData: TOverlay,
): Promise<ActionResult<{ overlayId: string }>> {
  try {
    log.info('Creating new overlay');

    const overlayId = OverlayService.createOverlay(overlayData);

    // Revalidate the home page to update any overlay lists
    revalidatePath('/');

    return {
      success: true,
      data: { overlayId },
    };
  } catch (error) {
    log.error('Error creating overlay:', error);
    return {
      success: false,
      error: 'Failed to create overlay',
    };
  }
}

/**
 * Server action to get an overlay by ID
 */
export async function getOverlay(id: string): Promise<ActionResult<TOverlay>> {
  try {
    if (!id) {
      return {
        success: false,
        error: 'Overlay ID is required',
      };
    }

    const overlay = OverlayService.getOverlay(id);

    if (!overlay) {
      return {
        success: false,
        error: 'Overlay not found or expired',
      };
    }

    return {
      success: true,
      data: overlay.data,
    };
  } catch (error) {
    log.error('Error getting overlay:', error);
    return {
      success: false,
      error: 'Failed to get overlay',
    };
  }
}

/**
 * Server action to update an overlay
 */
export async function updateOverlay(
  id: string,
  overlayData: TOverlay,
): Promise<ActionResult<{ success: boolean }>> {
  try {
    if (!id) {
      return {
        success: false,
        error: 'Overlay ID is required',
      };
    }

    const success = OverlayService.updateOverlay(id, overlayData);

    if (!success) {
      return {
        success: false,
        error: 'Overlay not found or expired',
      };
    }

    // Revalidate the overlay page and the update page
    revalidatePath(`/overlay/${id}`);
    revalidatePath(`/${id}`);

    return {
      success: true,
      data: { success: true },
    };
  } catch (error) {
    log.error('Error updating overlay:', error);
    return {
      success: false,
      error: 'Failed to update overlay',
    };
  }
}

/**
 * Server action to delete an overlay
 */
export async function deleteOverlay(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    if (!id) {
      return {
        success: false,
        error: 'Overlay ID is required',
      };
    }

    const success = OverlayService.deleteOverlay(id);

    if (!success) {
      return {
        success: false,
        error: 'Overlay not found or expired',
      };
    }

    // Revalidate relevant paths
    revalidatePath('/');

    return {
      success: true,
      data: { success: true },
    };
  } catch (error) {
    log.error('Error deleting overlay:', error);
    return {
      success: false,
      error: 'Failed to delete overlay',
    };
  }
}

/**
 * Server action to clean up expired overlays (admin function)
 */
export async function cleanupExpiredOverlays(): Promise<
  ActionResult<{ cleanedCount: number; stats: { active: number }; timestamp: string }>
> {
  try {
    const cleanedCount = OverlayService.cleanupExpired();
    const stats = OverlayService.getStats();
    const timestamp = new Date().toISOString();

    log.info(`Manual cleanup: Removed ${cleanedCount} expired overlays`);

    // Revalidate paths that might show overlay stats
    revalidatePath('/');

    return {
      success: true,
      data: {
        cleanedCount,
        stats,
        timestamp,
      },
    };
  } catch (error) {
    log.error('Error in manual cleanup:', error);
    return {
      success: false,
      error: 'Cleanup failed',
    };
  }
}

// Note: createOverlayAndRedirect removed since redirect() can only be used in Server Actions
// Client components should handle navigation with useRouter() instead

/**
 * Server action for form submission that updates an overlay
 */
export async function updateOverlayAction(
  id: string,
  overlayData: TOverlay,
): Promise<ActionResult<{ success: boolean }>> {
  return updateOverlay(id, overlayData);
}
