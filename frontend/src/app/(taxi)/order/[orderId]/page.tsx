"use client";

import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Car, Flag, MapPinned } from "lucide-react";
import { DriverCard } from "@/components/order/DriverCard";
import { OrderStatusBar } from "@/components/order/OrderStatus";
import { TripInfo } from "@/components/order/TripInfo";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useOrderStatus } from "@/hooks/useOrderStatus";
import { isDemoToken } from "@/lib/demo";
import { useOrderStore } from "@/store/orderStore";

const LeafletMap = dynamic(
  () => import("@/components/map/LeafletMap").then((m) => m.LeafletMap),
  { ssr: false, loading: () => <div className="h-full bg-[#E8F0EE]" /> },
);

export default function OrderPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const { currentOrder, patchOrder, token, updateOrderStatus } = useOrderStore();

  useOrderStatus(Number(orderId));

  useEffect(() => {
    if (currentOrder?.status === "trip_completed") {
      const t = setTimeout(() => router.push("/complete"), 2500);
      return () => clearTimeout(t);
    }
  }, [currentOrder?.status, router]);

  if (!currentOrder) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const isDemo = isDemoToken(token);

  const demoAction =
    currentOrder.status === "driver_assigned"
      ? {
          title: "Водитель уже едет к вам",
          description: "Посмотри интерфейс ожидания, затем можно переключить сценарий на прибытие водителя.",
          label: "Отметить прибытие водителя",
          icon: Car,
          onClick: () => updateOrderStatus("driver_arrived", 0),
        }
      : currentOrder.status === "driver_arrived"
        ? {
            title: "Водитель прибыл",
            description: "Теперь можно посмотреть экран посадки и перейти к поездке.",
            label: "Начать поездку",
            icon: MapPinned,
            onClick: () => patchOrder({ status: "trip_started", eta_minutes: 12 }),
          }
        : currentOrder.status === "trip_started"
          ? {
              title: "Поездка уже идёт",
              description: "Посмотри интерфейс во время поездки, затем можно завершить заказ и перейти к отзыву.",
              label: "Завершить поездку",
              icon: Flag,
              onClick: () => patchOrder({ status: "trip_completed", eta_minutes: 0 }),
            }
          : null;
  const DemoActionIcon = demoAction?.icon;

  const markers = [
    { lat: currentOrder.pickup_lat, lng: currentOrder.pickup_lon, kind: "route-a" as const },
    ...(currentOrder.destination_lat && currentOrder.destination_lon
      ? [{ lat: currentOrder.destination_lat, lng: currentOrder.destination_lon, kind: "route-b" as const }]
      : []),
    ...(currentOrder.driver?.id
      ? [{ lat: currentOrder.pickup_lat + 0.002, lng: currentOrder.pickup_lon + 0.001, kind: "driver" as const, label: currentOrder.driver.name }]
      : []),
  ];

  return (
    <div className="flex h-screen max-w-[430px] mx-auto flex-col overflow-hidden">
      {/* Карта */}
      <div className="flex-1 min-h-0">
        <LeafletMap
          center={[currentOrder.pickup_lat, currentOrder.pickup_lon]}
          zoom={14}
          markers={markers}
          className="h-full w-full"
        />
      </div>

      {/* Bottom sheet */}
      <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto rounded-t-[32px] bg-white px-4 pt-3 pb-6 shadow-[0_-14px_40px_rgba(24,39,75,0.12)]">
        <div className="mx-auto mb-1 h-1 w-10 rounded-full bg-[#d6dee2]" />

        <OrderStatusBar status={currentOrder.status} />

        {currentOrder.driver && (
          <DriverCard driver={currentOrder.driver} etaMinutes={currentOrder.eta_minutes} />
        )}

        {isDemo && demoAction && DemoActionIcon && (
          <div className="aparu-card p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-[var(--aparu-orange-soft)]">
                <DemoActionIcon size={20} color="#FF6B00" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[var(--aparu-ink)]">{demoAction.title}</p>
                <p className="mt-1 text-sm text-[var(--aparu-muted)]">{demoAction.description}</p>
              </div>
            </div>
            <Button className="mt-4" size="lg" onClick={demoAction.onClick}>
              {demoAction.label}
            </Button>
          </div>
        )}

        <TripInfo order={currentOrder} />
      </div>
    </div>
  );
}
