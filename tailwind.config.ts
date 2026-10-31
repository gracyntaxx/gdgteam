import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        aws: {
          bgPrimary: "#16191f",
          bgDark: "#0f141a",
          bgPanel: "#1b222d",
          bgCard: "#232b37",
          bgSurface: "#ffffff",
          textPrimary: "#ffffff",
          textLight: "#16191f",
          textSecondary: "#687078",
          textMuted: "#8c8c94",
          brandSecondary: "#ff9900", // AWS orange accent
          brandAccent: "#7300e5",    // AWS purple accent
          brandBlue: "#0073bb",      // AWS interactive blue
          borderLight: "#eaeded",
          borderDark: "#232b37",
          borderMuted: "#343d4d",
          success: "#00e582",
        },
      },
      fontFamily: {
        ember: ["Amazon Ember", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["AmazonEmberDuospace_Rg", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      borderRadius: {
        xs: "1px",
        DEFAULT: "4px",
        sm: "4px",
        md: "8px",
      },
      boxShadow: {
        awsCard: "0px 4px 20px 1px rgba(0, 7, 22, 0.1)",
        awsElevated: "0px 8px 30px rgba(0, 0, 0, 0.45)",
        awsInset: "inset 0px 1px 2px rgba(0, 0, 0, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
