import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import AppProviders from "@/components/AppProviders";

export const metadata: Metadata = {
  title: "Diccionario Técnico Web",
  description:
    "Buscador de términos técnicos en español para estudiantes de desarrollo web.",
};

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ui",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrains.variable} bg-neo-bg text-neo-text-primary antialiased dark:bg-neoDark-bg dark:text-neoDark-text-primary`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
