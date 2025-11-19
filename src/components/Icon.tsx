"use client";

import React from "react";
import type { ComponentType, SVGProps } from "react";
import * as LucideIcons from "lucide-react";
import * as PhosphorIcons from "phosphor-react";
import * as TablerIcons from "tabler-icons-react";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;
type IconLibrary = "lucide" | "phosphor" | "tabler";

const iconLibraries: Record<IconLibrary, Record<string, IconComponent>> = {
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
  const IconComponent = icons[name] as IconComponent | undefined;
  if (!IconComponent) {
    throw new Error(`Icon "${name}" not found in ${library} icons`);
  }

  return <IconComponent className={className} size={size} color={color} {...rest} />;
}

export const availableIconLibraries: IconLibrary[] = ["lucide", "phosphor", "tabler"];
