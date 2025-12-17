"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

type ThemeLogoProps = {
  alt?: string;
  width?: number;
  height?: number;
  size?: number;
  className?: string;
  priority?: boolean;
};

export function ThemeLogo({ alt = "Diccionario Dev", width, height, size, className, priority }: ThemeLogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const src = resolvedTheme === "light" ? "/logoModoclaro.png" : "/logoModoOscuro.png";
  const w = size ?? width ?? 40;
  const h = size ?? height ?? 40;

  // Antes de montar, usar logo oscuro por defecto para evitar parpadeos.
  const effectiveSrc = mounted ? src : "/logoModoOscuro.png";

  return (
    <Image
      src={effectiveSrc}
      alt={alt}
      width={w}
      height={h}
      className={`object-contain ${className || ""}`}
      priority={priority}
    />
  );
}
