// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx,js,jsx,html}"],
  theme: { extend: {} },
  plugins: {
    daisyui: {
      themes: [
        // your brand theme first so it's the default
        {
          brand: {
            primary: "#0ea5e9",
            "primary-content": "#001018",
            secondary: "#f97316",
            accent: "#22c55e",
            neutral: "#1f2937",
            "base-100": "#0b0f14",
            "base-200": "#0f172a",
            "base-300": "#111827",
            info: "#60a5fa",
            success: "#34d399",
            warning: "#f59e0b",
            error: "#ef4444",
          },
        },
        "light",
        "dark",
        "lofi",
        "cyberpunk",
        "cupcake",
        "bumblebee",
        "emerald",
        "corporate",
        "synthwave",
        "retro",
        "cyberpunk",
        "valentine",
        "halloween",
        "garden",
        "forest",
        "aqua",
        "pastel",
        "fantasy",
        "wireframe",
        "black",
        "luxury",
        "dracula",
        "cmyk",
        "autumn",
        "business",
        "acid",
        "lemonade",
        "night",
        "coffee",
        "winter"
      ],
    },
  },
}
