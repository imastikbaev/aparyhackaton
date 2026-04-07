"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MapPin, Navigation } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { createOrder } from "@/lib/api";
import { useOrderStore } from "@/store/orderStore";

export default function ConfirmPage() {
  const router = useRouter();
  const { token, currentQRPoint, pendingOrder, setOrder } = useOrderStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !currentQRPoint) router.replace("/");
  }, [token, currentQRPoint, router]);

  const handleConfirm = async () => {
    if (!token || !currentQRPoint) return;
    setLoading(true);
    setError(null);
    try {
      const order = await createOrder(
        {
          qr_point_id: currentQRPoint.id,
          ...pendingOrder,
        },
        token,
      );
      setOrder(order);
      router.push(`/order/${order.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка создания заказа");
    } finally {
      setLoading(false);
    }
  };

  if (!currentQRPoint) return null;

  return (
    <AppShell showBack title="Подтверждение">
      <div className="flex flex-col gap-4 px-4 py-6">

        {/* Маршрут */}
        <div className="bg-white rounded-3xl border border-[#F0F0F0] p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-[#FF6B00] flex items-center justify-center flex-shrink-0">
              <MapPin size={15} color="white" />
            </div>
            <div>
              <p className="text-xs text-[#AAAAAA]">Откуда</p>
              <p className="font-semibold text-[#1A1A1A]">{currentQRPoint.name}</p>
              <p className="text-sm text-[#757575]">{currentQRPoint.address}</p>
            </div>
          </div>

          {pendingOrder?.destination_address && (
            <>
              <div className="ml-4 border-l-2 border-dashed border-[#EBEBEB] h-3" />
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-[#252525] flex items-center justify-center flex-shrink-0">
                  <Navigation size={15} color="white" />
                </div>
                <div>
                  <p className="text-xs text-[#AAAAAA]">Куда</p>
                  <p className="font-semibold text-[#1A1A1A]">{pendingOrder.destination_address}</p>
                </div>
              </div>
            </>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        <Button size="lg" onClick={handleConfirm} isLoading={loading}>
          Подтвердить заказ
        </Button>

        <Button variant="ghost" size="md" onClick={() => router.back()} disabled={loading}>
          Изменить
        </Button>
      </div>
    </AppShell>
  );
}
