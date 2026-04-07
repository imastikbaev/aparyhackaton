"use client";

import { useEffect, useRef } from "react";

import { getOrderWsUrl } from "@/lib/api";
import { useOrderStore } from "@/store/orderStore";
import type { WSStatusEvent } from "@/types";

export function useOrderStatus(orderId: number | null) {
  const { updateOrderStatus } = useOrderStore();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!orderId) return;

    const ws = new WebSocket(getOrderWsUrl(orderId));
    wsRef.current = ws;

    ws.onmessage = (event: MessageEvent<string>) => {
      try {
        const data = JSON.parse(event.data) as WSStatusEvent;
        if (data.type === "status_update") {
          updateOrderStatus(data.status, data.eta_minutes);
        }
      } catch {
        // ignore malformed messages
      }
    };

    ws.onerror = () => ws.close();

    // Ping каждые 25 сек, чтобы не дропнулось соединение
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) ws.send("ping");
    }, 25_000);

    return () => {
      clearInterval(pingInterval);
      ws.close();
      wsRef.current = null;
    };
  }, [orderId, updateOrderStatus]);
}
