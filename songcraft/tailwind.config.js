/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{ts,tsx,js,jsx,html}"],

  theme: {
    extend: {
      // Minimal semantic color hooks
      colors: {
        "app-bg": "var(--app-bg, var(--color-neutral-50))",
        "app-text": "var(--app-text, var(--color-neutral-900))",
        "app-brand": "var(--app-brand, var(--color-blue-600))",
        "app-border": "var(--app-border, var(--color-neutral-300))",

        // optional states (add only if you’ll use them)
        "app-accent": "var(--app-accent, var(--color-indigo-600))",
        "app-success": "var(--app-success, var(--color-emerald-600))",
        "app-warning": "var(--app-warning, var(--color-amber-500))",
        "app-danger": "var(--app-danger, var(--color-rose-600))",
      },

      // Typography: just alias families; keep Tailwind's sizes/weights
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },

      // A couple of radii + shadows from tokens (don’t flood it)
      borderRadius: {
        DEFAULT: "var(--radius-md, 0.375rem)",
        lg: "var(--radius-lg, 0.5rem)",
      },
      boxShadow: {
        sm: "var(--shadow-sm, 0 1px 2px 0 rgb(0 0 0 / 0.05))",
        md: "var(--shadow-md, 0 4px 6px -1px rgb(0 0 0 / 0.1))",
      },

      // Optional: named motion hooks
      transitionDuration: {
        fast: "var(--animate-duration-fast, 150ms)",
        DEFAULT: "var(--animate-duration-normal, 250ms)",
        slow: "var(--animate-duration-slow, 350ms)",
      },
      transitionTimingFunction: {
        DEFAULT: "var(--animate-easing-ease, ease)",
        in: "var(--animate-easing-ease-in, ease-in)",
        out: "var(--animate-easing-ease-out, ease-out)",
        "in-out": "var(--animate-easing-ease-in-out, ease-in-out)",
      },
    },
  },
};
