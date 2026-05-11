import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const placeRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      bookId: z.string(),
      name: z.string().min(1),
      importance: z.string(),
      region: z.string().optional(),
      atmosphere: z.string().optional(),
      description: z.string().optional(),
      imageUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => ctx.db.place.create({ data: input })),

  getByBookId: protectedProcedure
    .input(z.object({ bookId: z.string() }))
    .query(async ({ ctx, input }) => ctx.db.place.findMany({ where: { bookId: input.bookId } })),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      importance: z.string().optional(),
      region: z.string().optional(),
      atmosphere: z.string().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.place.update({ where: { id }, data });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => ctx.db.place.delete({ where: { id: input.id } })),
});