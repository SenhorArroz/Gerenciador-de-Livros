import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const itemRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      bookId: z.string(),
      name: z.string().min(1),
      category: z.string(),
      description: z.string().optional(),
      origin: z.string().optional(),
      relatedTo: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => ctx.db.item.create({ data: input })),

  getByBookId: protectedProcedure
    .input(z.object({ bookId: z.string() }))
    .query(async ({ ctx, input }) => ctx.db.item.findMany({ where: { bookId: input.bookId } })),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      category: z.string().optional(),
      description: z.string().optional(),
      origin: z.string().optional(),
      relatedTo: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.item.update({ where: { id }, data });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => ctx.db.item.delete({ where: { id: input.id } })),
});