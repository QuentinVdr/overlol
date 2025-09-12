/**
 * Global JSON request utility with timeout and error handling
 * @param url - The URL to fetch
 * @param options - Optional fetch options (headers, method, etc.)
 * @param timeoutMs - Timeout in milliseconds (default: 5000)
 * @returns Promise with parsed JSON response
 */
export const jsonRequest = async <T = unknown>(
  url: string,
  options: Omit<RequestInit, 'signal'> = {},
  timeoutMs: number = 5000,
): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
};
