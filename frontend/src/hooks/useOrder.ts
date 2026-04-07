"use client";

import { useState } from "react";

import { createOrder } from "@/lib/api";
import { useOrderStore } from "@/store/orderStore";
import type { OrderCreate } from "@/types";

export function useOrder() {
  const { token, setOrder } = useOrderStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitOrder(data: OrderCreate): Promise<number | null> {
    if (!token) {
      setError("Требуется авторизация");
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const order = await createOrder(data, token);
      setOrder(order);
      return order.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка создания заказа");
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, submitOrder };
}
