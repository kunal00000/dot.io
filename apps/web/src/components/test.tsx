'use client';

import { trpc } from '@/app/_trpc/client';

const Test = () => {
  const x = trpc.gethello.useQuery();
  return <div>{JSON.stringify(x.data)}</div>;
};

export default Test;
