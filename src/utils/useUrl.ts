import { useEffect, useState } from 'react';

/**
 * Custom hook to get the current URL in client components
 * @param path - Optional path to append to the base URL
 * @returns The full URL or null if not yet mounted
 */
export function useFullUrl(path?: string): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      setUrl(path ? `${baseUrl}${path}` : baseUrl);
    }
  }, [path]);

  return url;
}

/**
 * Custom hook to get the base URL in client components
 * @returns The base URL or null if not yet mounted
 */
export function useBaseUrl(): string | null {
  const [baseUrl, setBaseUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(`${window.location.protocol}//${window.location.host}`);
    }
  }, []);

  return baseUrl;
}
