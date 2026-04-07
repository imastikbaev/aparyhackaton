"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface AppShellProps {
  children: React.ReactNode;
  showBack?: boolean;
  title?: string;
  transparentHeader?: boolean;
}

export function AppShell({ children, showBack, title, transparentHeader }: AppShellProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen max-w-[430px] mx-auto bg-white relative">
      {/* Header */}
      <header
        className={[
          "sticky top-0 z-20 flex items-center gap-3 px-4 h-14",
          transparentHeader
            ? "absolute inset-x-0 bg-transparent"
            : "bg-white border-b border-[#F0F0F0]",
        ].join(" ")}
      >
        {showBack && (
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm"
          >
            <ArrowLeft size={20} color="#1A1A1A" />
          </button>
        )}

        {/* Logo или заголовок */}
        {title ? (
          <span className="flex-1 text-center font-semibold text-[#1A1A1A] text-[16px]">
            {title}
          </span>
        ) : (
          <div className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/aparu/logo.svg" alt="APARU" className="h-6 w-auto" />
          </div>
        )}

        {showBack && title && <div className="w-9" />}
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
