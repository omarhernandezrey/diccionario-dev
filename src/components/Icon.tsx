"use client";

import React from "react";
import * as LucideIcons from "lucide-react";
import * as PhosphorIcons from "phosphor-react";
import * as TablerIcons from "tabler-icons-react";

type IconLibrary = "lucide" | "phosphor" | "tabler";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iconLibraries: Record<IconLibrary, any> = {
  lucide: LucideIcons,
  phosphor: PhosphorIcons,
  tabler: TablerIcons,
};

export type IconProps = {
  name: string;
  library?: IconLibrary;
  className?: string;
  size?: number | string;
  color?: string;
  "aria-hidden"?: boolean;
};

export function Icon({
  name,
  library = "lucide",
  className,
  size = 20,
  color,
  ...rest
}: IconProps) {
  const icons = iconLibraries[library];
  const IconComponent = icons[name];
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in ${library} icons`);
    return null;
  }

  return <IconComponent className={className} size={size} color={color} {...rest} />;
}

export const availableIconLibraries: IconLibrary[] = ["lucide", "phosphor", "tabler"];
