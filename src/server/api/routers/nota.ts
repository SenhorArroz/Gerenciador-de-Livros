import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const noteRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      bookId: z.string(),
      title: z.string(),
      description: z.string(),
      color: z.string(),
      rotation: z.string(),
    }))
    .mutation(async ({ ctx, input }) => ctx.db.note.create({ data: input })),

  getByBookId: protectedProcedure
    .input(z.object({ bookId: z.string() }))
    .query(async ({ ctx, input }) => ctx.db.note.findMany({
      where: { bookId: input.bookId },
      orderBy: { id: "desc" }, // Mais recentes primeiro
    })),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      color: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.note.update({ where: { id }, data });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => ctx.db.note.delete({ where: { id: input.id } })),
});