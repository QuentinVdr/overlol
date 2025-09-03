'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

export const ReactQueryProvider = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <QueryClientProvider client={queryClient}>
    <ReactQueryDevtools buttonPosition="bottom-right" position="bottom" />
    {children}
  </QueryClientProvider>
);
