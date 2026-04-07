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
      "inline-flex items-center justify-center font-semibold rounded-2xl transition-all active:scale-[0.97] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary: "bg-[#FF6B00] text-white shadow-sm hover:bg-[#e05f00]",
      secondary: "bg-white text-[#1A1A1A] border border-[#EBEBEB] hover:bg-gray-50",
      ghost: "text-[#FF6B00] hover:bg-orange-50",
    };

    const sizes = {
      sm: "h-9 px-4 text-sm gap-1.5",
      md: "h-12 px-5 text-[15px] gap-2",
      lg: "h-14 px-6 text-[16px] gap-2 w-full",
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
