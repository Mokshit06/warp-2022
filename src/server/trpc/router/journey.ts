import { router, publicProcedure, protectedProcedure } from '../trpc';
import { prisma } from '../../db/client';
import { z } from 'zod';
import fetch from 'node-fetch';

const unsplash =
  'https://api.unsplash.com/photos/random?query=mountains&client_id=3dKVH4wrUND8E27vRTMU6J3437-BLNcDENWEyhwegiI';

export const journeyRouter = router({
  listJourneys: publicProcedure.query(() => {
    return prisma.journey.findMany({
      include: {
        _count: { select: { climbers: true } },
      },
    });
  }),
  getJourney: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(({ input }) => {
      return prisma.journey.findUnique({
        where: { id: input.id },
        include: {
          places: true,
          suggestions: true,
          climbers: true,
        },
      });
    }),
  createJourney: protectedProcedure
    .input(
      z.object({
        from: z.string(),
        to: z.string(),
        name: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const res = (await fetch(unsplash).then(r => r.json())) as any;

      return prisma.journey.create({
        data: {
          from: input.from,
          to: input.to,
          name: input.name,
          image: res.urls.regular,
          climbers: {
            connect: {
              id: ctx.session.user.id,
            },
          },
        },
      });
    }),
  getMessages: protectedProcedure
    .input(z.object({ journey: z.string() }))
    .query(({ input }) => {
      return prisma.message.findMany({
        where: { journeyId: input.journey },
        include: { sentBy: true },
      });
    }),
  joinJourney: protectedProcedure
    .input(z.object({ journey: z.string() }))
    .mutation(({ input, ctx }) => {
      return prisma.journey.update({
        where: { id: input.journey },
        data: { climbers: { connect: { id: ctx.session.user.id } } },
      });
    }),
});
