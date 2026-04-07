"use client";

import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "@/components/ui/AparuIcons";

interface AppShellProps {
  children: React.ReactNode;
  showBack?: boolean;
  title?: string;
  transparentHeader?: boolean;
}

export function AppShell({ children, showBack, title, transparentHeader }: AppShellProps) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen max-w-[430px] mx-auto flex-col relative bg-transparent">
      {/* Header */}
      <header
        className={[
          "sticky top-0 z-20 flex items-center gap-3 px-4 h-16",
          transparentHeader
            ? "absolute inset-x-0 bg-transparent"
            : "aparu-header-glass border-b border-white/70",
        ].join(" ")}
      >
        {showBack && (
          <button
            onClick={() => router.back()}
            className="flex h-11 w-11 items-center justify-center rounded-[20px] bg-white shadow-[0_10px_24px_rgba(24,39,75,0.12)]"
          >
            <ChevronLeftIcon size={20} className="text-[#2A3037]" />
          </button>
        )}

        {/* Logo или заголовок */}
        {title ? (
          <span className="flex-1 text-center text-[16px] font-semibold text-[var(--aparu-ink)]">
            {title}
          </span>
        ) : (
          <div className="flex items-center rounded-[18px] bg-white/90 px-3 py-2 shadow-[0_8px_24px_rgba(24,39,75,0.1)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/aparu/logo.svg" alt="APARU" className="h-5 w-auto" />
          </div>
        )}

        {showBack && title && <div className="w-9" />}
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
