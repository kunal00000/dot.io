import { httpBatchLink } from '@trpc/client';

import { appRouter } from '@/trpc';
import { NEXT_PUBLIC_VERCEL_URL } from '@/lib/config';

export const serverClient = appRouter.createCaller({
  links: [
    httpBatchLink({
      url: `${NEXT_PUBLIC_VERCEL_URL}/api/trpc`
    })
  ]
});
