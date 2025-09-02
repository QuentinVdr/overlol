import { headers } from 'next/headers';

/**
 * Get the full URL for a given path in a server component
 * @param path - The path to append to the base URL (should start with /)
 * @returns The full URL including protocol and hostname
 */
export async function getFullUrl(path: string): Promise<string> {
  const headersList = await headers();
  const host = headersList.get('host');

  // Check for forwarded protocol (useful for production environments behind proxies)
  const protocol =
    headersList.get('x-forwarded-proto') || headersList.get('x-forwarded-ssl') === 'on'
      ? 'https'
      : 'http';

  return `${protocol}://${host}${path}`;
}

/**
 * Get the base URL (protocol + hostname) in a server component
 * @returns The base URL without any path
 */
export async function getBaseUrl(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get('host');

  const protocol =
    headersList.get('x-forwarded-proto') || headersList.get('x-forwarded-ssl') === 'on'
      ? 'https'
      : 'http';

  return `${protocol}://${host}`;
}
