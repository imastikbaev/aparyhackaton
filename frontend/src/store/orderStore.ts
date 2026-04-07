import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Order, OrderCreate, QRPoint } from "@/types";

interface OrderState {
  token: string | null;
  phone: string | null;
  currentQRPoint: QRPoint | null;
  currentOrder: Order | null;
  pendingOrder: Partial<OrderCreate> | null;

  setToken: (token: string, phone: string) => void;
  setQRPoint: (point: QRPoint) => void;
  setOrder: (order: Order) => void;
  updateOrderStatus: (status: Order["status"], etaMinutes?: number) => void;
  reset: () => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      token: null,
      phone: null,
      currentQRPoint: null,
      currentOrder: null,
      pendingOrder: null,

      setToken: (token, phone) => set({ token, phone }),
      setQRPoint: (point) => set({ currentQRPoint: point }),
      setOrder: (order) => set({ currentOrder: order }),

      updateOrderStatus: (status, etaMinutes) =>
        set((state) => ({
          currentOrder: state.currentOrder
            ? { ...state.currentOrder, status, eta_minutes: etaMinutes ?? state.currentOrder.eta_minutes }
            : null,
        })),

      reset: () => set({ currentOrder: null, pendingOrder: null }),
    }),
    {
      name: "aparu-store",
      partialize: (s) => ({ token: s.token, phone: s.phone, currentQRPoint: s.currentQRPoint }),
    },
  ),
);
