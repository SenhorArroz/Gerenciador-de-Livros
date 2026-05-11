import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const characterRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      bookId: z.string(),
      name: z.string().min(1),
      role: z.string(),
      inventory: z.string().nullish(),
      age: z.string().nullish(),
      category: z.string().nullish(),
      description: z.string().nullish(),
      imageUrl: z.string().nullish(),
    }))
    .mutation(async ({ ctx, input }) => ctx.db.character.create({ data: input })),

  getByBookId: protectedProcedure
    .input(z.object({ bookId: z.string() }))
    .query(async ({ ctx, input }) => ctx.db.character.findMany({ where: { bookId: input.bookId } })),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      role: z.string().optional(),
      inventory: z.string().nullish(),
      age: z.string().nullish(),
      category: z.string().nullish(),
      description: z.string().nullish(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.character.update({ where: { id }, data });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => ctx.db.character.delete({ where: { id: input.id } })),
});