import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'warm-bg': '#FFF8F0',
        'warm-bg-dark': '#FFF0E0',
        'letter-kleur': '#6366F1',
        'cijfer-kleur': '#F59E0B',
        'vorm-kleur': '#10B981',
        'succes': '#34D399',
        'aanmoediging': '#FBBF24',
        'template': '#CBD5E1',
        'pad': '#94A3B8',
      },
      fontFamily: {
        'kind': ['Nunito', 'Quicksand', 'sans-serif'],
      },
      borderRadius: {
        'kind': '1.5rem',
      },
      spacing: {
        'touch': '44px',
      },
    },
  },
  plugins: [],
} satisfies Config;
