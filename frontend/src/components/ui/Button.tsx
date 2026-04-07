import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", isLoading, className, children, disabled, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center font-semibold rounded-[22px] transition-all active:scale-[0.985] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary: "bg-[var(--aparu-orange)] text-white shadow-[0_16px_28px_rgba(255,107,0,0.24)] hover:brightness-95",
      secondary: "bg-white text-[var(--aparu-ink)] border border-[var(--aparu-line)] shadow-[0_12px_24px_rgba(24,39,75,0.08)] hover:bg-[#fbfcfc]",
      ghost: "text-[var(--aparu-orange)] hover:bg-[var(--aparu-orange-soft)]",
    };

    const sizes = {
      sm: "h-10 px-4 text-sm gap-1.5",
      md: "h-12 px-5 text-[15px] gap-2",
      lg: "h-[58px] px-6 text-[16px] gap-2 w-full",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Загрузка...
          </>
        ) : children}
      </button>
    );
  }
);

Button.displayName = "Button";
