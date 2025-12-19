import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AppProviders from "@/components/AppProviders";

export const metadata: Metadata = {
  title: "Diccionario Dev",
  description:
    "IA semántica para shipping serio. Buscador de términos técnicos y snippets para desarrolladores.",
};

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ui",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${jetbrains.variable} dd-app bg-neo-bg text-neo-text-primary antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
