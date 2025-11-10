import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
