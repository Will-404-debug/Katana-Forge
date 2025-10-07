import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        oniBlack: "#0b0b0b",
        katanaRed: "#b91c1c",
        emberGold: "#fbbf24",
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      backgroundImage: {
        sunburst: "radial-gradient(circle at center, rgba(251, 191, 36, 0.15), transparent 55%)",
      },
    },
  },
  plugins: [],
};

export default config;
