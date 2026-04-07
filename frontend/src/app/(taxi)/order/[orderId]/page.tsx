"use client";

import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Phone } from "lucide-react";

import { DriverCard } from "@/components/order/DriverCard";
import { OrderStatusBar } from "@/components/order/OrderStatus";
import { TripInfo } from "@/components/order/TripInfo";
import { AppShell } from "@/components/layout/AppShell";
import { Spinner } from "@/components/ui/Spinner";
import { useOrderStatus } from "@/hooks/useOrderStatus";
import { useOrderStore } from "@/store/orderStore";

const LeafletMap = dynamic(
  () => import("@/components/map/LeafletMap").then((m) => m.LeafletMap),
  { ssr: false, loading: () => <div className="h-full bg-[#E8F0EE]" /> },
);

export default function OrderPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const { currentOrder } = useOrderStore();

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

  const markers = [
    { lat: currentOrder.pickup_lat, lng: currentOrder.pickup_lon, color: "orange" as const },
    ...(currentOrder.destination_lat && currentOrder.destination_lon
      ? [{ lat: currentOrder.destination_lat, lng: currentOrder.destination_lon, color: "dark" as const }]
      : []),
    ...(currentOrder.driver?.id
      ? [{ lat: currentOrder.pickup_lat + 0.002, lng: currentOrder.pickup_lon + 0.001, color: "dark" as const, label: currentOrder.driver.name }]
      : []),
  ];

  return (
    <div className="flex flex-col h-screen max-w-[430px] mx-auto bg-white overflow-hidden">
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
      <div className="bg-white rounded-t-3xl shadow-[0_-4px_24px_rgba(0,0,0,0.08)] px-4 pt-3 pb-6 flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
        <div className="w-10 h-1 bg-[#EBEBEB] rounded-full mx-auto mb-1" />

        <OrderStatusBar status={currentOrder.status} />

        {currentOrder.driver && (
          <DriverCard driver={currentOrder.driver} etaMinutes={currentOrder.eta_minutes} />
        )}

        <TripInfo order={currentOrder} />
      </div>
    </div>
  );
}
