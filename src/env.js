import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";


export const env = createEnv({
	server: {
		// Variáveis de Banco de Dados
		DATABASE_URL: z.string().url(),

		// Autenticação (Auth.js v5)
		AUTH_SECRET: z.string().min(1),
		AUTH_GOOGLE_ID: z.string().min(1),
		AUTH_GOOGLE_SECRET: z.string().min(1),

		// Uploadthing
		UPLOADTHING_SECRET: z.string().min(1),
		UPLOADTHING_TOKEN: z.string().min(1),

		NODE_ENV: z
			.enum(["development", "test", "production"])
			.default("development"),
	},

	client: {
		// NEXT_PUBLIC_CLIENTVAR: z.string(),
	},

	runtimeEnv: {
		AUTH_SECRET: process.env.AUTH_SECRET,
		AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
		AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
		UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET,
		UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
		DATABASE_URL: process.env.DATABASE_URL,
		NODE_ENV: process.env.NODE_ENV,
	},

	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	emptyStringAsUndefined: true,
	onValidationError: (error) => {
		console.error("❌ Erro de validação no .env:", error);
		throw new Error("Invalid environment variables");
	},
});
