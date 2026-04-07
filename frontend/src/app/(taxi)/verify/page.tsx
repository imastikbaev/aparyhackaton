"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useRef, useState } from "react";
import { Phone, ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/";

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
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...codeDigits];
    next[index] = digit;
    setCodeDigits(next);
    if (digit && index < 3) inputRefs.current[index + 1]?.focus();
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
            <div className="h-16 w-16 bg-[#FFF5EE] rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone size={28} color="#FF6B00" />
            </div>
            <h1 className="text-[22px] font-bold text-[#1A1A1A]">Введите номер</h1>
            <p className="mt-1 text-[14px] text-[#757575]">
              Отправим SMS с кодом подтверждения
            </p>
          </div>

          <form onSubmit={handlePhoneSubmit} className="flex flex-col gap-3">
            <input
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              className="h-14 w-full rounded-2xl bg-[#F5F5F5] px-4 text-[18px] font-semibold text-[#1A1A1A] placeholder:text-[#AAAAAA] tracking-wide outline-none focus:bg-white focus:ring-2 focus:ring-[#FF6B00]/30"
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
            <div className="h-16 w-16 bg-[#FFF5EE] rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={28} color="#FF6B00" />
            </div>
            <h1 className="text-[22px] font-bold text-[#1A1A1A]">Код из SMS</h1>
            <p className="mt-1 text-[14px] text-[#757575]">
              Отправили на{" "}
              <span className="font-semibold text-[#1A1A1A]">{phone}</span>
            </p>
          </div>

          {/* Dev-подсказка с кодом */}
          {devCode && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-center">
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
                  autoFocus={i === 0}
                  className="h-16 w-16 rounded-2xl bg-[#F5F5F5] text-center text-[28px] font-bold text-[#1A1A1A] outline-none focus:bg-white focus:ring-2 focus:ring-[#FF6B00]/40 transition-all"
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
              className="text-sm text-[#757575] text-center hover:text-[#FF6B00] transition-colors"
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
