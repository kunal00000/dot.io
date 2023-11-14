'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import React, { PropsWithChildren, useState } from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { trpc } from './client';
import { NEXT_PUBLIC_VERCEL_URL } from '@/lib/config';

export default function Provider({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient({}));
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${NEXT_PUBLIC_VERCEL_URL}/api/trpc`
        })
      ]
    })
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools />
      </QueryClientProvider>
    </trpc.Provider>
  );
}
