import type { Config } from "tailwindcss";

const config: Config = {
  // Enables class-based dark mode support
  darkMode: ["class"],

  // Specifies where Tailwind should look for class usage
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}", // Include page files
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // Include component files
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // Include App Router files
  ],

  theme: {
    extend: {
      // Centralized color palette for easy customization
      colors: {
        // Brand colors for primary design elements
        brand: {
          "100": "#EA6365", // Light variant
          DEFAULT: "#FA7275", // Default (used when `brand` is referenced)
        },

        // Individual colors for specific use cases
        red: "#FF7474", // Error messages, critical highlights
        error: "#b80000", // Explicit error indication
        green: "#3DD9B3", // Success or positive actions
        blue: "#56B8FF", // Informational or links
        pink: "#EEA8FD", // Accent or playful elements
        orange: "#F9AB72", // Warnings or call-to-action highlights

        // Light mode-specific colors
        light: {
          "100": "#333F4E", // Darker text or UI elements
          "200": "#A3B2C7", // Muted text or secondary details
          "300": "#F2F5F9", // Backgrounds and cards
          "400": "#F2F4F8", // Alternate background shades
        },

        // Dark mode-specific colors
        dark: {
          "100": "#04050C", // Background for headers or footers
          "200": "#131524", // Subtle background contrast
        },

        // Dynamic color variables for custom theming
        background: "hsl(var(--background))", // Background color
        foreground: "hsl(var(--foreground))", // Text and content color

        // Component-specific colors
        card: {
          DEFAULT: "hsl(var(--card))", // Card background
          foreground: "hsl(var(--card-foreground))", // Card text
        },
        popover: {
          DEFAULT: "hsl(var(--popover))", // Popover background
          foreground: "hsl(var(--popover-foreground))", // Popover text
        },
        primary: {
          DEFAULT: "hsl(var(--primary))", // Primary button background
          foreground: "hsl(var(--primary-foreground))", // Primary button text
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))", // Secondary elements
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))", // Muted elements like subtitles
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))", // Special accents or highlights
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))", // Destructive action (delete)
          foreground: "hsl(var(--destructive-foreground))",
        },

        // Border, input, and focus-ring colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        // Chart colors for data visualization
        chart: {
          "1": "hsl(var(--chart-1))", // First chart color
          "2": "hsl(var(--chart-2))", // Second chart color
          "3": "hsl(var(--chart-3))", // Third chart color
          "4": "hsl(var(--chart-4))", // Fourth chart color
          "5": "hsl(var(--chart-5))", // Fifth chart color
        },
      },

      // Centralized font family management
      fontFamily: {
        poppins: ["var(--font-poppins)"], // Use CSS variable for Poppins font
      },

      // Shadow styles for elevated UI components
      boxShadow: {
        "drop-1": "0px 10px 30px 0px rgba(66, 71, 97, 0.1)", // Subtle shadow
        "drop-2": "0 8px 30px 0 rgba(65, 89, 214, 0.3)", // Medium shadow
        "drop-3": "0 8px 30px 0 rgba(65, 89, 214, 0.1)", // Lighter shadow
      },

      // Border radius for consistent rounding
      borderRadius: {
        lg: "var(--radius)", // Large radius
        md: "calc(var(--radius) - 2px)", // Medium radius
        sm: "calc(var(--radius) - 4px)", // Small radius
      },

      // Keyframes for animations
      keyframes: {
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" }, // Blinking effect
          "20%,50%": { opacity: "0" },
        },
      },
      animation: {
        "caret-blink": "caret-blink 1.25s ease-out infinite", // Caret animation
      },
    },
  },

  // Plugins for additional functionality
  plugins: [require("tailwindcss-animate")],
};

export default config;
