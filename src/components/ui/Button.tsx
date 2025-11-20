import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/lib/cn";

type Variant = "solid" | "soft" | "outline";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  solid: "bg-neo-primary text-white hover:bg-neo-primary-dark shadow-lg shadow-neo-primary/20",
  soft: "bg-neo-surface text-neo-text-primary hover:bg-neo-card border border-neo-border",
  outline: "border border-neo-border text-neo-text-primary hover:border-neo-text-secondary hover:bg-neo-surface",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

export type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
    size?: Size;
    fullWidth?: boolean;
  }
>;

export function Button({ children, className, variant = "solid", size = "md", type = "button", fullWidth, ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "rounded-full font-semibold tracking-wide transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary disabled:opacity-50 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full justify-center",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
