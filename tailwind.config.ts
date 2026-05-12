import { type Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme"; // <-- Importação corrigida!
import { withUt } from "uploadthing/tw";

export default withUt({
  content: [
    "./src/**/*.tsx",
    "./src/**/*.ts",
    "./src/**/*.jsx",
    "./src/**/*.js",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Agora acessamos a fonte de dentro do defaultTheme
        sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
}) satisfies Config;