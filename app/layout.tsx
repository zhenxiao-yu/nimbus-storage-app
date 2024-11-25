import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { Analytics } from "@vercel/analytics/next";

// Configure the Poppins font with multiple weights and CSS variable
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

// Metadata for the application
export const metadata: Metadata = {
  title: "NIMBUS",
  description: "Nimbus: The Future of Cloud Storage.",
};

/**
 * RootLayout Component
 * Wraps the entire application layout with global configurations,
 * including fonts and metadata.
 *
 * @param children - The content to render inside the layout.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-poppins antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
