import type { Metadata } from "next";
import "./globals.css";
import AppProviders from "@/components/AppProviders";

export const metadata: Metadata = {
  title: "Diccionario Técnico Web",
  description:
    "Buscador de términos técnicos en español para estudiantes de desarrollo web.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="bg-ink-900 text-white antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
