import { InputHTMLAttributes, ReactNode, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-sm font-medium text-[#757575]">{label}</label>}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-4 text-[#AAAAAA] flex items-center">{leftIcon}</div>
        )}
        <input
          ref={ref}
          className={cn(
            "h-12 w-full rounded-2xl bg-[#F5F5F5] px-4 text-[15px] text-[#1A1A1A] placeholder:text-[#AAAAAA]",
            "transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 focus:bg-white",
            error ? "ring-2 ring-red-400 bg-white" : undefined,
            leftIcon ? "pl-11" : undefined,
            rightIcon ? "pr-11" : undefined,
            className,
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-4 text-[#AAAAAA] flex items-center">{rightIcon}</div>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
);

Input.displayName = "Input";
