'use client';

import { trpc } from '@/app/_trpc/client';

const Test = () => {
  const y = trpc.getShortUrl.useQuery(
    {
      originalUrl: 'https://google.com'
    },
    {
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: false
    }
  );

  const x = trpc.shorten.useMutation({
    onSettled: () => {
      console.log('refetch');
      y.refetch();
    }
  });

  return (
    <div>
      {y.data?.shortUrl}
      <br />
      <button onClick={() => x.mutate({ originalUrl: 'https://google.com' })}>
        hell
      </button>
    </div>
  );
};

export default Test;
