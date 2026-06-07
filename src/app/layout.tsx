import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ChakraProviders } from "@/components/ChakraProviders";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Notes",
  description: "A clean, modern note-taking app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <ChakraProviders>{children}</ChakraProviders>
      </body>
    </html>
  );
}
