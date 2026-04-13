"use client";

import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Car, Flag, MapPinned, MessageCircleMore, Send, Share2, Ticket, XCircle } from "lucide-react";
import { DriverCard } from "@/components/order/DriverCard";
import { OfflineTicketCard } from "@/components/order/OfflineTicketCard";
import { OrderStatusBar } from "@/components/order/OrderStatus";
import { TripInfo } from "@/components/order/TripInfo";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useOrderStatus } from "@/hooks/useOrderStatus";
import { cancelOrder } from "@/lib/api";
import { isDemoQrId, isDemoToken } from "@/lib/demo";
import { createSharedTripPayload, getSharedTripState, getSharedTripUrl } from "@/lib/tripShare";
import { useOrderStore } from "@/store/orderStore";

const LeafletMap = dynamic(
  () => import("@/components/map/LeafletMap").then((m) => m.LeafletMap),
  { ssr: false, loading: () => <div className="h-full bg-[#E8F0EE]" /> },
);

export default function OrderPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const { currentOrder, currentQRPoint, patchOrder, reset, token, updateOrderStatus } = useOrderStore();
  const [shareState, setShareState] = useState<"idle" | "copied">("idle");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showOfflineTicket, setShowOfflineTicket] = useState(false);
  const [mapCollapsed, setMapCollapsed] = useState(false);
  const sheetRef = useRef<HTMLDivElement | null>(null);

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

  const isDemo = isDemoQrId(currentQRPoint?.id ?? "") || isDemoToken(token);
  const isLegacyDemoToken = isDemoToken(token);
  const sharePayload = useMemo(
    () => (currentOrder ? createSharedTripPayload(currentOrder) : null),
    [currentOrder],
  );
  const liveDemoState = useMemo(
    () => (sharePayload ? getSharedTripState(sharePayload) : null),
    [sharePayload],
  );

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
    ...((liveDemoState?.driverPosition && currentOrder.driver?.id)
      ? [{
          lat: liveDemoState.driverPosition.lat,
          lng: liveDemoState.driverPosition.lng,
          kind: "driver" as const,
          label: currentOrder.driver.name,
        }]
      : []),
  ];

  const shareUrl =
    typeof window !== "undefined" && sharePayload
      ? getSharedTripUrl(sharePayload, window.location.origin)
      : "";

  const handleShareTrip = async () => {
    if (!shareUrl) return;

    if (navigator.share) {
      await navigator.share({
        title: "Поездка APARU",
        text: "Отслеживайте мою поездку в APARU в реальном времени",
        url: shareUrl,
      });
      return;
    }

    await navigator.clipboard.writeText(shareUrl);
    setShareState("copied");
    setTimeout(() => setShareState("idle"), 1800);
  };

  const handleCancelOrder = async () => {
    if (!currentOrder || currentOrder.status !== "searching") return;

    setCancelLoading(true);
    try {
      if (token && !isLegacyDemoToken) {
        const cancelled = await cancelOrder(currentOrder.id, token);
        patchOrder(cancelled);
      } else if (isDemo) {
        patchOrder({ status: "cancelled", eta_minutes: 0 });
      }
      reset();
      if (currentQRPoint) {
        router.push(`/scan/${currentQRPoint.id}`);
      } else {
        router.push("/");
      }
    } finally {
      setCancelLoading(false);
    }
  };

  const handleSheetScroll = () => {
    const nextCollapsed = (sheetRef.current?.scrollTop ?? 0) > 32;
    setMapCollapsed((prev) => (prev === nextCollapsed ? prev : nextCollapsed));
  };

  return (
    <div className="flex h-screen max-w-[430px] mx-auto flex-col overflow-hidden">
      {/* Карта */}
      <div
        className={`shrink-0 overflow-hidden transition-[height] duration-300 ease-out ${
          mapCollapsed ? "h-[180px]" : "h-[46vh]"
        }`}
      >
        <LeafletMap
          center={[currentOrder.pickup_lat, currentOrder.pickup_lon]}
          zoom={14}
          markers={markers}
          className="h-full w-full"
        />
      </div>

      {/* Bottom sheet */}
      <div
        ref={sheetRef}
        onScroll={handleSheetScroll}
        className="-mt-6 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto rounded-t-[32px] bg-white px-4 pt-5 pb-6 shadow-[0_-14px_40px_rgba(24,39,75,0.12)]"
      >
        <div className="sticky top-0 z-10 -mx-4 -mt-5 bg-white px-4 pt-5 pb-3">
          <div className="mx-auto mb-1 h-1 w-10 rounded-full bg-[#d6dee2]" />
        </div>

        <OrderStatusBar status={currentOrder.status} />

        {currentOrder.status === "searching" && (
          <div className="aparu-card p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-[#fff2f2] text-[#d64545]">
                <XCircle size={20} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[var(--aparu-ink)]">Можно отменить поиск</p>
                <p className="mt-1 text-sm text-[var(--aparu-muted)]">
                  Пока водитель ещё не назначен, заказ можно отменить без потери сессии.
                </p>
              </div>
            </div>
            <Button className="mt-4" variant="secondary" size="lg" onClick={handleCancelOrder} isLoading={cancelLoading}>
              Отменить заказ
            </Button>
          </div>
        )}

        {currentOrder.driver && (
          <DriverCard driver={currentOrder.driver} etaMinutes={currentOrder.eta_minutes} />
        )}

        {currentOrder.driver && currentOrder.status !== "searching" && currentOrder.status !== "trip_completed" && (
          <div className="aparu-card p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-[var(--aparu-orange-soft)]">
                <Ticket size={20} color="#FF6B00" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[var(--aparu-ink)]">Оффлайн-карточка</p>
                <p className="mt-1 text-sm text-[var(--aparu-muted)]">
                  Сохраните данные водителя — карточка работает без интернета.
                </p>
              </div>
            </div>
            <Button className="mt-4" variant="secondary" size="lg" onClick={() => setShowOfflineTicket(true)}>
              <Ticket size={16} />
              Сохранить карточку
            </Button>
          </div>
        )}

        {currentOrder.driver && shareUrl && currentOrder.status !== "trip_completed" && (
          <div className="aparu-card p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-[var(--aparu-teal-soft)] text-[var(--aparu-teal)]">
                <Share2 size={20} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[var(--aparu-ink)]">Поделиться поездкой</p>
                <p className="mt-1 text-sm text-[var(--aparu-muted)]">
                  Отправьте близким ссылку, где видно движение такси и статус поездки.
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <Button size="md" onClick={handleShareTrip} className="w-full">
                <Share2 size={16} />
                {shareState === "copied" ? "Скопировано" : "Поделиться"}
              </Button>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[22px] bg-[#27A6E5] px-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(39,166,229,0.22)]"
              >
                <Send size={15} />
                Telegram
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[22px] bg-[#25D366] px-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(37,211,102,0.22)]"
              >
                <MessageCircleMore size={15} />
                WhatsApp
              </a>
            </div>
          </div>
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

      {showOfflineTicket && currentOrder.driver && (
        <OfflineTicketCard
          orderId={currentOrder.id}
          driver={currentOrder.driver}
          pickupAddress={currentOrder.pickup_address}
          onClose={() => setShowOfflineTicket(false)}
        />
      )}
    </div>
  );
}
