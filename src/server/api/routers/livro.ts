import { z } from "zod";
import { randomInt } from 'crypto';
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const bookRouter = createTRPCRouter({

  // CREATE
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string(),
      plotSummary: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const generateInviteCode = (): string =>
        Array.from({ length: 3 }, () =>
          String.fromCharCode(65 + randomInt(0, 26))
        ).join('') +
        '-' +
        Array.from({ length: 8 }, () =>
          randomInt(0, 10)
        ).join('');

      const inviteCode: string = generateInviteCode();

      return ctx.db.book.create({
        data: {
          ...input,
          inviteCode, // Salvando o seu código gerado
          // Nova relação Many-to-Many
          users: {
            connect: { id: ctx.session.user.id },
          },
        },
      });
    }),

  // READ (Todos os livros do usuário logado para a Escrivaninha)
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.book.findMany({
      where: { 
        users: { some: { id: ctx.session.user.id } } // Busca correta na lista
      },
      orderBy: { updatedAt: "desc" }, 
    });
  }),

  // READ (Dados completos para a Visão Geral do Livro)
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.book.findFirst({
        where: { 
          id: input.id, 
          users: { some: { id: ctx.session.user.id } } // Busca correta na lista
        },
        include: {
          _count: {
            select: { characters: true, places: true, chapters: true, items: true },
          },
          notes: { take: 5, orderBy: { id: "desc" } }, 
        },
      });
    }),

  // EXTRA: Entrar em um livro via código de convite
  joinByCode: protectedProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const cleanCode = input.code.trim().toUpperCase();
      
      console.log("🚨 [DEBUG] CÓDIGO RECEBIDO DA UI:", input.code);
      console.log("🚨 [DEBUG] CÓDIGO LIMPO (BUSCA):", cleanCode);

      const book = await ctx.db.book.findFirst({
        where: { inviteCode: cleanCode }, 
      });

      if (!book) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Código de convite inválido ou livro não encontrado.",
        });
      }

      // Conecta o usuário ao livro
      return ctx.db.book.update({
        where: { id: book.id },
        data: {
          users: {
            connect: { id: ctx.session.user.id },
          },
        },
      });
    }),

  // UPDATE
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      plotSummary: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      
      // 1. Verifica se o usuário tem acesso ao livro antes de atualizar
      const book = await ctx.db.book.findFirst({
        where: { id, users: { some: { id: ctx.session.user.id } } }
      });
      if (!book) throw new TRPCError({ code: "UNAUTHORIZED" });

      // 2. Atualiza (Prisma exige que o where do update seja único)
      return ctx.db.book.update({
        where: { id },
        data,
      });
    }),

  // DELETE
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // 1. Verifica se o usuário tem acesso ao livro antes de deletar
      const book = await ctx.db.book.findFirst({
        where: { id: input.id, users: { some: { id: ctx.session.user.id } } }
      });
      if (!book) throw new TRPCError({ code: "UNAUTHORIZED" });

      // 2. Deleta o livro
      return ctx.db.book.delete({
        where: { id: input.id },
      });
    }),
});