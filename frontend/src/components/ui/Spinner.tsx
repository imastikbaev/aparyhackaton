import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-8 w-8 animate-spin rounded-full border-3 border-[#EBEBEB] border-t-[#FF6B00]",
        className,
      )}
    />
  );
}
