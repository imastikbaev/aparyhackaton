"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Download, Navigation, Share2 } from "lucide-react";

import { DriverCard } from "@/components/order/DriverCard";
import { OrderStatusBar } from "@/components/order/OrderStatus";
import { Button } from "@/components/ui/Button";
import { RouteBadgeIcon } from "@/components/ui/AparuIcons";
import { decodeSharedTripPayload, getSharedTripState } from "@/lib/tripShare";

const LeafletMap = dynamic(
  () => import("@/components/map/LeafletMap").then((m) => m.LeafletMap),
  { ssr: false, loading: () => <div className="h-full bg-[#E8F0EE]" /> },
);

export default function SharedTripPage() {
  const { token } = useParams<{ token: string }>();
  const payload = useMemo(() => decodeSharedTripPayload(token), [token]);
  const [now, setNow] = useState(Date.now());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(timer);
  }, []);

  if (!payload) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center">
        <div className="aparu-card max-w-[420px] p-6">
          <p className="text-lg font-semibold text-[var(--aparu-ink)]">Ссылка на поездку недействительна</p>
          <p className="mt-2 text-sm text-[var(--aparu-muted)]">
            Попросите пассажира отправить новую ссылку для отслеживания.
          </p>
        </div>
      </div>
    );
  }

  const live = getSharedTripState(payload, now);
  const markers = [
    { lat: payload.pickup.lat, lng: payload.pickup.lon, kind: "route-a" as const, label: payload.pickup.address },
    ...(payload.destination.lat != null && payload.destination.lon != null
      ? [{
          lat: payload.destination.lat,
          lng: payload.destination.lon,
          kind: "route-b" as const,
          label: payload.destination.address ?? "Точка назначения",
        }]
      : []),
    ...(live.driverPosition && payload.driver
      ? [{
          lat: live.driverPosition.lat,
          lng: live.driverPosition.lng,
          kind: "driver" as const,
          label: payload.driver.name,
        }]
      : []),
  ];

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="flex min-h-screen max-w-[430px] mx-auto flex-col bg-transparent">
      <div className="relative flex-[0_0_46vh] min-h-[320px]">
        <LeafletMap
          center={[payload.pickup.lat, payload.pickup.lon]}
          zoom={14}
          markers={markers}
          className="h-full w-full"
        />
        <div className="absolute left-4 top-4 z-[1000] rounded-[20px] bg-white/92 px-4 py-2 shadow-[0_16px_30px_rgba(24,39,75,0.16)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/aparu/logo.svg" alt="APARU" className="h-5 w-auto" />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 rounded-t-[32px] bg-white px-4 pt-4 pb-6 shadow-[0_-14px_40px_rgba(24,39,75,0.12)]">
        <div className="mx-auto h-1 w-10 rounded-full bg-[#d6dee2]" />

        <div className="aparu-card p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[var(--aparu-teal-soft)] text-[var(--aparu-teal)]">
              <Share2 size={20} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[var(--aparu-ink)]">Вы отслеживаете поездку APARU</p>
              <p className="mt-1 text-sm text-[var(--aparu-muted)]">
                Статус и положение машины обновляются автоматически.
              </p>
            </div>
          </div>
        </div>

        <OrderStatusBar status={live.status} />

        {payload.driver && (
          <DriverCard driver={payload.driver} etaMinutes={live.etaMinutes} />
        )}

        <div className="aparu-card space-y-3 p-4">
          <div className="flex items-start gap-3">
            <RouteBadgeIcon label="A" tone="orange" size={28} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-[var(--aparu-orange)]">Откуда</p>
              <p className="text-[14px] font-medium text-[var(--aparu-ink)]">{payload.pickup.address}</p>
            </div>
          </div>
          {payload.destination.address && (
            <>
              <div className="ml-3.5 h-3 border-l-2 border-dashed border-[#dde5e8]" />
              <div className="flex items-start gap-3">
                <RouteBadgeIcon label="B" tone="teal" size={28} className="mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-[var(--aparu-teal)]">Куда</p>
                  <p className="text-[14px] font-medium text-[var(--aparu-ink)]">{payload.destination.address}</p>
                </div>
              </div>
            </>
          )}
          <div className="h-px bg-[var(--aparu-line)]" />
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--aparu-muted)]">Тариф</span>
            <span className="font-semibold text-[var(--aparu-ink)]">
              {payload.tariff === "economy" ? "Эконом" : payload.tariff === "comfort" ? "Комфорт" : "Стандарт"}
            </span>
          </div>
          {payload.priceEstimate != null && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--aparu-muted)]">Стоимость</span>
              <span className="font-semibold text-[var(--aparu-ink)]">~{Math.round(payload.priceEstimate)} ₸</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent("Слежение за поездкой APARU")}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-[22px] bg-[#27A6E5] px-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(39,166,229,0.22)]"
          >
            <Navigation size={16} />
            Telegram
          </a>
          <button
            type="button"
            onClick={async () => {
              if (!currentUrl) return;
              await navigator.clipboard.writeText(currentUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 1800);
            }}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-[22px] border border-[var(--aparu-line)] bg-white px-4 text-sm font-semibold text-[var(--aparu-ink)] shadow-[0_12px_24px_rgba(24,39,75,0.08)]"
          >
            <Share2 size={16} />
            {copied ? "Скопировано" : "Копировать ссылку"}
          </button>
        </div>

        <div className="aparu-card bg-[linear-gradient(135deg,#0b9ea6_0%,#1699a1_62%,#f28a1a_100%)] p-4 text-white">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-white text-[var(--aparu-ink)]">
              <Download size={18} />
            </div>
            <div>
              <p className="font-semibold">Заказать свою поездку быстрее в APARU</p>
              <p className="mt-1 text-sm text-white/85">
                Устанавливайте приложение и отслеживайте поездки в один тап.
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link
              href="https://apps.apple.com/kz/developer/%D1%82%D0%BE%D0%BE-aparu/id1409103369"
              target="_blank"
              className="inline-flex h-11 items-center justify-center rounded-[18px] bg-white/16 px-4 text-sm font-semibold text-white backdrop-blur"
            >
              App Store
            </Link>
            <Link
              href="https://play.google.com/store/apps/details?id=kz.aparu.aparupassenger"
              target="_blank"
              className="inline-flex h-11 items-center justify-center rounded-[18px] bg-white/16 px-4 text-sm font-semibold text-white backdrop-blur"
            >
              Google Play
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
