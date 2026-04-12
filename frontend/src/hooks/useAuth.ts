"use client";

import { useState } from "react";
import { sendOTP, verifyOTP } from "@/lib/api";
import { useOrderStore } from "@/store/orderStore";

type Step = "phone" | "otp" | "done";

export function useAuth() {
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
      const res = await sendOTP(phoneNumber);
      setPhone(phoneNumber);
      // В mock-режиме бэкенд возвращает код прямо в ответе, в том числе для demo QR.
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
