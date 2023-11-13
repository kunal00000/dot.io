import { z } from 'zod';
import { publicProcedure, router } from './trpc';
import { nanoid } from 'nanoid';
import { db } from '@/db';
import { TRPCError } from '@trpc/server';

export const appRouter = router({
  hello: publicProcedure.query(() => {
    return {
      greeting: `hello`
    };
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
        shortUrl: linkFound.shortUrl
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

      const shortKey = nanoid(8);

      await db.link.create({
        data: {
          shortUrl: shortKey,
          targetUrl: originalUrl
        }
      });

      return { success: true };
    })

  //
});

export type AppRouter = typeof appRouter;
