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
          "100": "#0f0e46", // Light variant
          DEFAULT: "#262755", // Default (used when `brand` is referenced)
        },

        // Individual colors for specific use cases
        red: "#FF7474", // Error messages, critical highlights
        error: "#fd6584", // Explicit error indication
        green: "#47c58d", // Success or positive actions
        blue: "#4157fd", // Informational or links
        pink: "#EEA8FD", // Accent or playful elements
        orange: "#fdb60f", // Warnings or call-to-action highlights

        // Light mode-specific colors
        light: {
          "100": "#233543", // Darker text or UI elements
          "200": "#455564", // Muted text or secondary details
          "300": "#929ca5", // Backgrounds and cards
          "400": "#ced0d2", // Alternate background shades
        },

        // Dark mode-specific colors
        dark: {
          "100": "#04141c", // Background for headers or footers
          "200": "#111e2c", // Subtle background contrast
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
        "drop-1": "0px 4px 12px rgba(66, 71, 97, 0.08)", // Light shadow for subtle elevation (e.g., buttons or small cards)
        "drop-2": "0px 6px 20px rgba(65, 89, 214, 0.15)", // Medium shadow for elevated components (e.g., modals, tooltips)
        "drop-3": "0px 12px 40px rgba(65, 89, 214, 0.2)", // Heavy shadow for prominent components (e.g., dropdowns, large cards)
      },

      // Border radius for consistent rounding
      borderRadius: {
        lg: "var(--radius)", // Large radius
        md: "calc(var(--radius) - 2px)", // Medium radius
        sm: "calc(var(--radius) - 4px)", // Small radius
        pill: "50px", // Rounded pill shape for tags or buttons
        circle: "50%", // Perfect circle for avatars and circular icons
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
