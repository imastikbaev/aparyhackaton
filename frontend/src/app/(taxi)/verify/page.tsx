"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useRef, useState } from "react";
import { Phone, ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { isDemoQrId } from "@/lib/demo";
import { useAuth } from "@/hooks/useAuth";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/";
  const demoMode = nextPath.includes("/scan/") && isDemoQrId(nextPath.split("/scan/")[1]?.split("?")[0] ?? "");

  const { step, phone, loading, error, devCode, requestOTP, confirmOTP } = useAuth();
  const [phoneInput, setPhoneInput] = useState("+7");
  const [codeDigits, setCodeDigits] = useState(["", "", "", ""]);

  // Один ref-массив — не нарушает правила хуков
  const inputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await requestOTP(phoneInput);
  };

  const handleDigit = (index: number, val: string) => {
    const normalized = val.replace(/\D/g, "");

    // Safari/iOS OTP autofill can drop the whole code into a single field.
    if (normalized.length > 1) {
      const next = normalized.slice(0, 4).split("");
      while (next.length < 4) next.push("");
      setCodeDigits(next);
      const focusIndex = Math.min(normalized.length, 4) - 1;
      inputRefs.current[Math.max(focusIndex, 0)]?.focus();
      return;
    }

    const digit = normalized.slice(-1);
    const next = [...codeDigits];
    next[index] = digit;
    setCodeDigits(next);
    if (digit && index < 3) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!pasted) return;
    e.preventDefault();

    const next = pasted.split("");
    while (next.length < 4) next.push("");
    setCodeDigits(next);
    inputRefs.current[Math.min(pasted.length, 4) - 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !codeDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = codeDigits.join("");
    if (code.length < 4) return;
    const ok = await confirmOTP(code);
    if (ok) router.push(nextPath);
  };

  const codeComplete = codeDigits.every((d) => d !== "");

  return (
    <div className="flex flex-col gap-6 px-4 py-8">
      {step === "phone" ? (
        <>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--aparu-orange-soft)]">
              <Phone size={28} color="#FF6B00" />
            </div>
            <h1 className="text-[22px] font-bold text-[var(--aparu-ink)]">Введите номер</h1>
            <p className="mt-1 text-[14px] text-[var(--aparu-muted)]">
              Отправим SMS с кодом подтверждения
            </p>
            {demoMode && (
              <p className="mt-2 text-xs text-[#FF6B00]">
                Демо-режим: заказ сохранится в БД, а тестовый код появится на экране в mock-режиме
              </p>
            )}
          </div>

          <form onSubmit={handlePhoneSubmit} className="flex flex-col gap-3">
            <input
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              className="h-14 w-full rounded-[22px] border border-transparent bg-[var(--aparu-surface-soft)] px-4 text-[18px] font-semibold tracking-wide text-[var(--aparu-ink)] placeholder:text-[#a3afb5] outline-none focus:bg-white focus:ring-2 focus:ring-[var(--aparu-orange)]/25"
              inputMode="tel"
              autoFocus
            />
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            <Button type="submit" size="lg" isLoading={loading}>
              Получить код
            </Button>
          </form>
        </>
      ) : (
        <>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--aparu-orange-soft)]">
              <ShieldCheck size={28} color="#FF6B00" />
            </div>
            <h1 className="text-[22px] font-bold text-[var(--aparu-ink)]">Код из SMS</h1>
            <p className="mt-1 text-[14px] text-[var(--aparu-muted)]">
              Отправили на{" "}
              <span className="font-semibold text-[var(--aparu-ink)]">{phone}</span>
            </p>
          </div>

          {/* Dev-подсказка с кодом */}
          {devCode && (
            <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-3 text-center">
              <p className="text-xs text-amber-600 font-medium">Тестовый режим — ваш код:</p>
              <p className="text-2xl font-bold text-amber-800 tracking-[0.3em] mt-0.5">
                {devCode}
              </p>
            </div>
          )}

          <form onSubmit={handleCodeSubmit} className="flex flex-col gap-4">
            {/* 4 отдельных поля ввода */}
            <div className="flex gap-3 justify-center">
              {codeDigits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigit(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  autoFocus={i === 0}
                  autoComplete={i === 0 ? "one-time-code" : undefined}
                  className="h-16 w-16 rounded-[22px] bg-[var(--aparu-surface-soft)] text-center text-[28px] font-bold text-[var(--aparu-ink)] outline-none transition-all focus:bg-white focus:ring-2 focus:ring-[var(--aparu-orange)]/35"
                />
              ))}
            </div>

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <Button
              type="submit"
              size="lg"
              isLoading={loading}
              disabled={!codeComplete}
            >
              Подтвердить
            </Button>

            <button
              type="button"
              onClick={() => requestOTP(phone)}
              className="text-center text-sm text-[var(--aparu-muted)] transition-colors hover:text-[var(--aparu-orange)]"
            >
              Отправить код повторно
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <AppShell showBack>
      <Suspense
        fallback={
          <div className="flex justify-center pt-20">
            <Spinner />
          </div>
        }
      >
        <VerifyForm />
      </Suspense>
    </AppShell>
  );
}
