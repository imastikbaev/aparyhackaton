"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { RouteBadgeIcon } from "@/components/ui/AparuIcons";
import { Button } from "@/components/ui/Button";
import { createOrder } from "@/lib/api";
import { estimateDistanceMeters, estimatePrice } from "@/lib/pricing";
import { useOrderStore } from "@/store/orderStore";

export default function ConfirmPage() {
  const router = useRouter();
  const { token, currentQRPoint, pendingOrder, setOrder } = useOrderStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasDestination =
    pendingOrder?.destination_lat != null &&
    pendingOrder?.destination_lon != null &&
    Boolean(pendingOrder.destination_address);

  useEffect(() => {
    if (!token || !currentQRPoint) {
      router.replace("/");
      return;
    }

    if (!hasDestination) {
      router.replace(`/scan/${currentQRPoint.id}`);
    }
  }, [currentQRPoint, hasDestination, router, token]);

  const handleConfirm = async () => {
    if (!token || !currentQRPoint || !pendingOrder || !hasDestination) return;
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
      setOrder({
        ...order,
        comment: pendingOrder.comment ?? order.comment,
        stopovers: pendingOrder.stopovers ?? order.stopovers,
      });
      router.push(`/order/${order.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка создания заказа");
    } finally {
      setLoading(false);
    }
  };

  if (!currentQRPoint || !hasDestination) return null;

  const distanceMeters =
    pendingOrder.destination_lat != null && pendingOrder.destination_lon != null
      ? estimateDistanceMeters(
          { latitude: currentQRPoint.latitude, longitude: currentQRPoint.longitude },
          { latitude: pendingOrder.destination_lat, longitude: pendingOrder.destination_lon },
        )
      : null;
  const estimatedPrice = distanceMeters != null ? estimatePrice(distanceMeters, pendingOrder?.tariff) : null;

  return (
    <AppShell showBack title="Подтверждение">
      <div className="flex flex-col gap-4 px-4 py-6">

        {/* Маршрут */}
        <div className="aparu-card space-y-3 p-4">
          <div className="flex items-start gap-3">
            <RouteBadgeIcon label="A" tone="orange" />
            <div>
              <p className="text-xs text-[var(--aparu-orange)]">Откуда</p>
              <p className="font-semibold text-[var(--aparu-ink)]">{currentQRPoint.name}</p>
              <p className="text-sm text-[var(--aparu-muted)]">{currentQRPoint.address}</p>
            </div>
          </div>

          {pendingOrder?.destination_address && (
            <>
              {pendingOrder.stopovers?.map((stop, index) => (
                <div key={`${stop.address}-${index}`}>
                  <div className="ml-5 h-3 border-l-2 border-dashed border-[#d9e1e4]" />
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[var(--aparu-teal-soft)] text-xs font-bold text-[var(--aparu-teal)]">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-xs text-[var(--aparu-teal)]">Остановка</p>
                      <p className="font-semibold text-[var(--aparu-ink)]">{stop.address}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="ml-5 h-3 border-l-2 border-dashed border-[#d9e1e4]" />
              <div className="flex items-start gap-3">
                <RouteBadgeIcon label="B" tone="teal" />
                <div>
                  <p className="text-xs text-[var(--aparu-teal)]">Куда</p>
                  <p className="font-semibold text-[var(--aparu-ink)]">{pendingOrder.destination_address}</p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="aparu-card grid grid-cols-2 gap-3 p-4">
          <div>
            <p className="text-xs text-[var(--aparu-muted)]">Тариф</p>
            <p className="mt-1 font-semibold text-[var(--aparu-ink)]">
              {pendingOrder?.tariff === "economy"
                ? "Эконом"
                : pendingOrder?.tariff === "comfort"
                  ? "Комфорт"
                  : "Стандарт"}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--aparu-muted)]">Оплата</p>
            <p className="mt-1 font-semibold text-[var(--aparu-ink)]">
              {pendingOrder?.payment_method === "card" ? "Карта" : "Наличные"}
            </p>
          </div>
          {estimatedPrice != null && (
            <div className="col-span-2 rounded-[18px] bg-[var(--aparu-orange-soft)] px-3 py-3">
              <p className="text-xs text-[var(--aparu-orange)]">Примерная стоимость</p>
              <p className="mt-1 text-lg font-bold text-[var(--aparu-orange)]">~{estimatedPrice} ₸</p>
            </div>
          )}
          {pendingOrder?.comment && (
            <div className="col-span-2 rounded-[18px] bg-[var(--aparu-surface-soft)] px-3 py-3">
              <p className="text-xs text-[var(--aparu-muted)]">Комментарий водителю</p>
              <p className="mt-1 text-sm text-[var(--aparu-ink)]">{pendingOrder.comment}</p>
            </div>
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
