'use client';

import { trpc } from '@/app/_trpc/client';
import { useState } from 'react';

const Test = () => {
  const [url, setUrl] = useState('');

  const x = trpc.shorten.useMutation({
    onSuccess: () => {
      links.refetch();
    }
  });

  const links = trpc.getAllUrls.useQuery();

  return (
    <div>
      <br />
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await x.mutate({ originalUrl: url });
          } catch (error) {
            console.log(error);
          }
        }}
      >
        <input
          type='text'
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          name='originalUrl'
        />
        <button type='submit'>hell</button>
      </form>

      <ol>
        {links.data?.map((link) => (
          <li key={link.id}>
            <a
              href={`http://localhost:3000/${link.shortkey}`}
              target='_blank'
              rel='noopener noreferrer'
            >
              http://localhost:3000/{link.shortkey}
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default Test;
