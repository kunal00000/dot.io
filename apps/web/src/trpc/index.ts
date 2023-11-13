import { z } from 'zod';
import { publicProcedure, router } from './trpc';
import { nanoid } from 'nanoid';
import { db } from '@/db';
import { TRPCError } from '@trpc/server';
import { getMetaTags } from '@/lib/utils';

export const appRouter = router({
  hello: publicProcedure.query(() => {
    return {
      greeting: `hello`
    };
  }),

  getAllUrls: publicProcedure.query(async () => {
    return await db.link.findMany({});
  }),

  // query: to get short url for target url
  getShortUrl: publicProcedure
    .input(
      z.object({
        originalUrl: z.string().url()
      })
    )
    .query(async ({ input }) => {
      const { originalUrl } = input;

      const linkFound = await db.link.findFirst({
        where: {
          targetUrl: originalUrl
        }
      });

      if (!linkFound) throw new TRPCError({ code: 'NOT_FOUND' });

      return {
        shortkey: linkFound.shortkey
      };
    }),

  getTargetUrl: publicProcedure
    .input(z.object({ shortkey: z.string().length(8) }))
    .query(async ({ input }) => {
      const { shortkey } = input;

      const linkFound = await db.link.findUnique({
        where: {
          shortkey
        }
      });

      if (!linkFound)
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Link not found' });

      return {
        targetUrl: linkFound.targetUrl
      };
    }),

  // mutate: for url shortening (original -> short-url)
  shorten: publicProcedure
    .input(
      z.object({
        originalUrl: z.string().url()
      })
    )
    .mutation(async ({ input }) => {
      const { originalUrl } = input;

      const linkExist = await db.link.findFirst({
        where: {
          targetUrl: originalUrl
        }
      });
      if (linkExist)
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Link already exists'
        });

      const key = nanoid(8);

      // Fetch OG metadata if the target URL is valid
      let metadata = null;
      try {
        metadata = await getMetaTags(originalUrl);
      } catch (error) {
        console.error('Error fetching metadata:', error);
      }

      await db.link.create({
        data: {
          shortkey: key,
          targetUrl: originalUrl,
          title: metadata?.title,
          description: metadata?.description,
          image: metadata?.image
        }
      });

      return { success: true };
    })
});

export type AppRouter = typeof appRouter;
