"use client";

import { useState } from "react";
import { sendOTP, verifyOTP } from "@/lib/api";
import { DEMO_OTP_CODE, DEMO_TOKEN } from "@/lib/demo";
import { useOrderStore } from "@/store/orderStore";

type Step = "phone" | "otp" | "done";

export function useAuth(demoMode = false) {
  const { setToken } = useOrderStore();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function requestOTP(phoneNumber: string) {
    setLoading(true);
    setError(null);
    try {
      if (demoMode) {
        setPhone(phoneNumber);
        setDevCode(DEMO_OTP_CODE);
        setStep("otp");
        return;
      }
      const res = await sendOTP(phoneNumber);
      setPhone(phoneNumber);
      // В mock-режиме бэкенд возвращает код прямо в ответе
      setDevCode(res.dev_code ?? null);
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка отправки кода");
    } finally {
      setLoading(false);
    }
  }

  async function confirmOTP(code: string): Promise<boolean> {
    setLoading(true);
    setError(null);
    try {
      if (demoMode) {
        if (code !== DEMO_OTP_CODE) {
          setError("Для демо используйте код 1111");
          return false;
        }
        setToken(DEMO_TOKEN, phone);
        setStep("done");
        return true;
      }
      const data = await verifyOTP(phone, code);
      setToken(data.access_token, phone);
      setStep("done");
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неверный код");
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { step, phone, devCode, loading, error, requestOTP, confirmOTP };
}
