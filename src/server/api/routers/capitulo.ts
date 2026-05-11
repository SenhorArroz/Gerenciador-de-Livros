import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const chapterRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      bookId: z.string(),
      number: z.string(),
      shortTitle: z.string(),
      title: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.chapter.create({ data: input });
    }),

  getByBookId: protectedProcedure
    .input(z.object({ bookId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.chapter.findMany({
        where: { bookId: input.bookId },
        orderBy: { number: "asc" }, // Ordena pelo número do capítulo
      });
    }),

  // EXTRA: Salvar especificamente o conteúdo do editor de texto
  saveContent: protectedProcedure
    .input(z.object({
      id: z.string(),
      content: z.string(),
      status: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.chapter.update({
        where: { id: input.id },
        data: { content: input.content, status: input.status },
      });
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().optional(),
      shortTitle: z.string().optional(),
      status: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.chapter.update({ where: { id }, data });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.chapter.delete({ where: { id: input.id } });
    }),
});