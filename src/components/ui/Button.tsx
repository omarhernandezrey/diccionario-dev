import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/lib/cn";

type Variant = "solid" | "soft" | "outline";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  solid: "bg-gradient-to-r from-accent-primary to-accent-secondary text-ink-900 hover:opacity-90",
  soft: "bg-white/10 text-white hover:bg-white/20",
  outline: "border border-white/30 text-white hover:border-white hover:bg-white/5",
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
