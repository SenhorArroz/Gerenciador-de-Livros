import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { bookRouter } from "./routers/livro";
import { characterRouter } from "./routers/personagens";
import { placeRouter } from "./routers/local";
import { chapterRouter } from "./routers/capitulo";
import { noteRouter } from "./routers/nota";
import { itemRouter } from "./routers/item";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	book: bookRouter,
	character: characterRouter,
	place: placeRouter,
	chapter: chapterRouter,
	note: noteRouter,
	item: itemRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
