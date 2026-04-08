"use client";

import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Building2, Crosshair, Hotel, Navigation, Pill, Soup, Stethoscope, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { CardWalletIcon, CashWalletIcon, RouteBadgeIcon } from "@/components/ui/AparuIcons";
import { buildRoute, geocodeAddress, getQRPoint, reverseGeocode } from "@/lib/api";
import { getNearbyPlaceRecommendations, searchLocalAddresses } from "@/lib/localAddressSearch";
import { estimateDistanceMeters, estimatePrice } from "@/lib/pricing";
import { formatDistanceKm, formatDurationMin } from "@/lib/utils";
import { useOrderStore } from "@/store/orderStore";
import type { GeocodeResult, NearbyPlace, NearbyPlaceCategory, PaymentMethod, QRPoint, RouteResponse } from "@/types";

const LeafletMap = dynamic(
  () => import("@/components/map/LeafletMap").then((m) => m.LeafletMap),
  { ssr: false, loading: () => <div className="h-full bg-[#E8F0EE]" /> },
);

export default function ScanPage() {
  const { qrId } = useParams<{ qrId: string }>();
  const router = useRouter();
  const { token, setPendingOrder, setQRPoint } = useOrderStore();

  const [qrPoint, setQrPointLocal] = useState<QRPoint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Маршрут и назначение
  const [destQuery, setDestQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [selectedDest, setSelectedDest] = useState<GeocodeResult | null>(null);
  const [route, setRoute] = useState<RouteResponse | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [payment, setPayment] = useState<PaymentMethod>("cash");
  const [tariff, setTariff] = useState<"economy" | "standard" | "comfort">("standard");
  const [comment, setComment] = useState("");
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [selectionMode, setSelectionMode] = useState<"pickup" | "destination" | null>(null);
  const [pickingLoading, setPickingLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rebuildRoute = useCallback(
    async (
      pickup: { latitude: number; longitude: number },
      destination: { latitude: number; longitude: number } | null,
    ) => {
      if (!destination) {
        setRoute(null);
        return;
      }

      setRouteLoading(true);
      try {
        const r = await buildRoute([
          pickup,
          destination,
        ]);
        setRoute(r);
      } catch {
        setRoute(null);
      } finally {
        setRouteLoading(false);
      }
    },
    [],
  );

  const formatReverseAddress = useCallback((placeName: string, areaName: string, localityName?: string) => {
    return [placeName, areaName, localityName].filter(Boolean).join(", ");
  }, []);

  // Загружаем QR-точку
  useEffect(() => {
    getQRPoint(qrId)
      .then((p) => {
        setQrPointLocal(p);
        setQRPoint(p);
        setMapCenter([p.latitude, p.longitude]);
      })
      .catch(() => setError("QR-код не найден или недействителен"))
      .finally(() => setLoading(false));
  }, [qrId, setQRPoint]);

  useEffect(() => {
    if (!qrPoint) return;
    getNearbyPlaceRecommendations(qrPoint.latitude, qrPoint.longitude, 6)
      .then(setNearbyPlaces)
      .catch(() => setNearbyPlaces([]));
  }, [qrPoint]);

  // Поиск адреса назначения с debounce
  const handleDestInput = useCallback(
    (val: string) => {
      setDestQuery(val);
      setSelectedDest(null);
      setRoute(null);
      if (!val.trim() || !qrPoint) { setSuggestions([]); return; }

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        try {
          const [localResults, remoteResults] = await Promise.all([
            searchLocalAddresses(val, qrPoint.latitude, qrPoint.longitude, 6),
            geocodeAddress(val, qrPoint.latitude, qrPoint.longitude)
              .then((res) => res.results)
              .catch(() => []),
          ]);

          const merged = [...localResults, ...remoteResults].filter((item, index, array) => {
            const key = `${item.address}|${item.additionalInfo}|${item.latitude.toFixed(6)}|${item.longitude.toFixed(6)}`;
            return index === array.findIndex((candidate) => {
              const candidateKey = `${candidate.address}|${candidate.additionalInfo}|${candidate.latitude.toFixed(6)}|${candidate.longitude.toFixed(6)}`;
              return candidateKey === key;
            });
          });

          setSuggestions(merged.slice(0, 6));
        } catch {
          setSuggestions([]);
        }
      }, 400);
    },
    [qrPoint],
  );

  // Выбор адреса назначения → строим маршрут
  const selectDest = useCallback(
    async (item: GeocodeResult) => {
      setSelectedDest(item);
      setDestQuery(`${item.address}, ${item.additionalInfo}`);
      setSuggestions([]);
      if (!qrPoint) return;

      await rebuildRoute(
        { latitude: qrPoint.latitude, longitude: qrPoint.longitude },
        { latitude: item.latitude, longitude: item.longitude },
      );
    },
    [qrPoint, rebuildRoute],
  );

  const startPicking = useCallback((mode: "pickup" | "destination") => {
    if (!qrPoint) return;
    setSelectionMode(mode);
    setSuggestions([]);
    setMapCenter(
      mode === "pickup"
        ? [qrPoint.latitude, qrPoint.longitude]
        : selectedDest
          ? [selectedDest.latitude, selectedDest.longitude]
          : [qrPoint.latitude, qrPoint.longitude],
    );
  }, [qrPoint, selectedDest]);

  const confirmPickedPoint = useCallback(async () => {
    if (!mapCenter || !qrPoint || !selectionMode) return;

    setPickingLoading(true);
    try {
      const [latitude, longitude] = mapCenter;
      const reverse = await reverseGeocode(latitude, longitude).catch(() => null);
      const resolvedAddress = reverse
        ? formatReverseAddress(reverse.placeName, reverse.areaName, reverse.locality?.name)
        : `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

      if (selectionMode === "pickup") {
        const updatedPoint: QRPoint = {
          ...qrPoint,
          name: reverse?.placeName || qrPoint.name,
          address: resolvedAddress,
          latitude,
          longitude,
        };
        setQrPointLocal(updatedPoint);
        setQRPoint(updatedPoint);
        await rebuildRoute(
          { latitude, longitude },
          selectedDest
            ? { latitude: selectedDest.latitude, longitude: selectedDest.longitude }
            : null,
        );
      } else {
        const mappedDest: GeocodeResult = {
          address: reverse?.placeName || resolvedAddress,
          additionalInfo: [reverse?.areaName, reverse?.locality?.name].filter(Boolean).join(", "),
          latitude,
          longitude,
          type: "h",
        };
        setSelectedDest(mappedDest);
        setDestQuery(resolvedAddress);
        await rebuildRoute(
          { latitude: qrPoint.latitude, longitude: qrPoint.longitude },
          { latitude, longitude },
        );
      }

      setSelectionMode(null);
    } finally {
      setPickingLoading(false);
    }
  }, [formatReverseAddress, mapCenter, qrPoint, rebuildRoute, selectedDest, selectionMode, setQRPoint]);

  const canOrder = Boolean(
    selectedDest &&
    !selectionMode &&
    !routeLoading &&
    !pickingLoading,
  );

  const handleOrder = () => {
    if (!canOrder || !selectedDest) return;

    setPendingOrder({
      qr_point_id: qrId,
      destination_address: [selectedDest.address, selectedDest.additionalInfo].filter(Boolean).join(", "),
      destination_lat: selectedDest.latitude,
      destination_lon: selectedDest.longitude,
      tariff,
      payment_method: payment,
      comment: comment.trim() || undefined,
    });

    if (!token) {
      router.push(`/verify?next=/scan/${qrId}`);
    } else {
      router.push(`/confirm?qr=${qrId}`);
    }
  };

  const nearbyIcons: Record<NearbyPlaceCategory, typeof Building2> = {
    mall: Building2,
    pharmacy: Pill,
    hotel: Hotel,
    hospital: Stethoscope,
    cafe: Soup,
  };

  const nearbyLabels: Record<NearbyPlaceCategory, string> = {
    mall: "ТЦ",
    pharmacy: "Аптека",
    hotel: "Отель",
    hospital: "Больница",
    cafe: "Кафе",
  };

  // Маркеры карты
  const markers = useMemo(() => {
    if (!qrPoint) return [];

    return [
      { lat: qrPoint.latitude, lng: qrPoint.longitude, kind: "route-a" as const, label: qrPoint.name },
      ...(selectedDest
        ? [{ lat: selectedDest.latitude, lng: selectedDest.longitude, kind: "route-b" as const, label: selectedDest.address }]
        : []),
    ];
  }, [qrPoint, selectedDest]);

  const fallbackDistance =
    qrPoint && selectedDest
      ? estimateDistanceMeters(
          { latitude: qrPoint.latitude, longitude: qrPoint.longitude },
          { latitude: selectedDest.latitude, longitude: selectedDest.longitude },
        )
      : null;

  const fallbackTime = fallbackDistance != null ? (fallbackDistance / 7.8) * 1000 : null;

  const displayRoute = useMemo(() => {
    if (route) return route;
    if (!qrPoint || !selectedDest || fallbackDistance == null || fallbackTime == null) return null;

    return {
      distance: fallbackDistance,
      time: fallbackTime,
      coordinates: [
        [qrPoint.longitude, qrPoint.latitude],
        [selectedDest.longitude, selectedDest.latitude],
      ] as [number, number][],
      bbox: [
        Math.min(qrPoint.longitude, selectedDest.longitude),
        Math.min(qrPoint.latitude, selectedDest.latitude),
        Math.max(qrPoint.longitude, selectedDest.longitude),
        Math.max(qrPoint.latitude, selectedDest.latitude),
      ] as [number, number, number, number],
    };
  }, [fallbackDistance, fallbackTime, qrPoint, route, selectedDest]);

  const routeCoords = useMemo<[number, number][]>(() => {
    if (!displayRoute) return [];
    return displayRoute.coordinates.map(([lng, lat]) => [lat, lng]);
  }, [displayRoute]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <Spinner />
      </div>
    );
  }

  if (error || !qrPoint) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="aparu-card flex h-20 w-20 items-center justify-center rounded-[28px]">
          <RouteBadgeIcon label="A" size={40} />
        </div>
        <p className="text-lg font-semibold text-[var(--aparu-ink)]">QR-код не найден</p>
        <p className="text-sm text-[var(--aparu-muted)]">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen max-w-[430px] mx-auto flex-col overflow-hidden">
      {/* Карта (верхняя часть) */}
      <div className="relative z-0 flex-1 min-h-0">
        <LeafletMap
          center={mapCenter ?? [qrPoint.latitude, qrPoint.longitude]}
          zoom={15}
          markers={selectionMode ? [] : markers}
          routeCoords={routeCoords}
          autoFitRoute={!selectionMode}
          onMoveEnd={setMapCenter}
          className="h-full w-full"
        />

        {/* Лого поверх карты */}
        <div className="absolute top-4 left-4 z-[1000] rounded-[22px] bg-white px-4 py-2.5 shadow-[0_16px_30px_rgba(24,39,75,0.16)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/aparu/logo.svg" alt="APARU" className="h-5 w-auto" />
        </div>

        {!selectionMode && displayRoute && (
          <div className="pointer-events-none absolute inset-x-0 top-16 z-[1000] flex justify-center px-4">
            <div className="flex items-center gap-3 rounded-[22px] bg-white/94 px-4 py-2.5 shadow-[0_16px_30px_rgba(24,39,75,0.16)] backdrop-blur">
              <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-[var(--aparu-orange-soft)]">
                <span className="text-sm font-bold text-[var(--aparu-orange)]">A→B</span>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--aparu-orange)]">
                  Кратчайший путь
                </p>
                <p className="text-sm font-semibold text-[var(--aparu-ink)]">
                  {formatDistanceKm(displayRoute.distance)} · {formatDurationMin(displayRoute.time)}
                </p>
              </div>
            </div>
          </div>
        )}

        {selectionMode && (
          <>
            <div className="pointer-events-none absolute inset-x-0 top-16 z-[1000] flex justify-center px-4">
              <div className="rounded-[22px] bg-white/92 px-4 py-2 text-center shadow-[0_16px_30px_rgba(24,39,75,0.16)] backdrop-blur">
                <p className="text-xs font-semibold text-[var(--aparu-ink)]">
                  {selectionMode === "pickup" ? "Выберите точку посадки" : "Выберите точку назначения"}
                </p>
                <p className="mt-0.5 text-xs text-[var(--aparu-muted)]">
                  Двигайте карту и подтвердите точку
                </p>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-0 z-[999] flex items-center justify-center">
              <div className="flex flex-col items-center">
                <RouteBadgeIcon
                  label={selectionMode === "pickup" ? "A" : "B"}
                  tone={selectionMode === "pickup" ? "orange" : "teal"}
                  size={44}
                />
                <div className="-mt-1 h-3 w-[2px] rounded-full bg-[var(--aparu-ink)]/30" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Sheet */}
      <div className="relative z-[1100] flex max-h-[48vh] flex-col gap-2 overflow-y-auto rounded-t-[32px] bg-white px-4 pt-3 pb-5 shadow-[0_-14px_40px_rgba(24,39,75,0.12)]">
        {/* Drag handle */}
        <div className="mx-auto mb-1 h-1 w-10 rounded-full bg-[#d6dee2]" />

        {/* Точка А — откуда */}
        <div className="flex items-center gap-3 rounded-[24px] bg-[var(--aparu-orange-soft)] px-4 py-3">
          <RouteBadgeIcon label="A" tone="orange" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[var(--aparu-orange)]">Откуда</p>
            <p className="truncate text-[15px] font-semibold text-[var(--aparu-ink)]">{qrPoint.name}</p>
            <p className="truncate text-xs text-[var(--aparu-muted)]">{qrPoint.address}</p>
          </div>
          <button
            type="button"
            onClick={() => startPicking("pickup")}
            className="flex h-10 w-10 items-center justify-center rounded-[18px] bg-white text-[var(--aparu-orange)] shadow-[0_8px_16px_rgba(255,107,0,0.12)]"
          >
            <Crosshair size={18} />
          </button>
        </div>

        {/* Точка Б — куда */}
        <div className="relative">
          <div className="flex items-center gap-3 rounded-[24px] bg-[var(--aparu-surface-soft)] px-4 py-3">
            <RouteBadgeIcon label="B" tone="teal" />
            <input
              type="text"
              placeholder="Куда едем?"
              value={destQuery}
              onChange={(e) => handleDestInput(e.target.value)}
              className="flex-1 bg-transparent text-[14px] font-medium text-[var(--aparu-ink)] placeholder:text-[#9ca8ae] outline-none"
            />
            {destQuery && (
              <button onClick={() => { setDestQuery(""); setSelectedDest(null); setRoute(null); setSuggestions([]); }}>
                <X size={16} color="#93A0A7" />
              </button>
            )}
            <button
              type="button"
              onClick={() => startPicking("destination")}
              className="flex h-10 w-10 items-center justify-center rounded-[18px] bg-white text-[var(--aparu-teal)] shadow-[0_8px_16px_rgba(0,154,163,0.12)]"
            >
              <Crosshair size={18} />
            </button>
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-10 mt-2 overflow-hidden rounded-[24px] border border-[var(--aparu-line)] bg-white shadow-[0_20px_40px_rgba(24,39,75,0.14)]">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => selectDest(s)}
                  className="flex w-full items-start gap-3 border-b border-[#f2f5f6] px-4 py-3 text-left hover:bg-[#f9fbfb] last:border-0"
                >
                  <Navigation size={16} color="#009AA3" className="mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[14px] font-medium text-[var(--aparu-ink)]">{s.address}</p>
                    <p className="text-xs text-[var(--aparu-muted)]">{s.additionalInfo}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {!destQuery && !selectionMode && nearbyPlaces.length > 0 && (
          <div className="px-1 pt-0.5">
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--aparu-muted)]">
                Рядом
              </p>
              <p className="text-[10px] text-[var(--aparu-muted)]">Быстрый выбор</p>
            </div>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {nearbyPlaces.slice(0, 5).map((place, index) => {
                const Icon = nearbyIcons[place.category];
                return (
                  <button
                    key={`${place.address}-${index}`}
                    type="button"
                    onClick={() => selectDest(place)}
                    className="flex w-auto max-w-[150px] flex-shrink-0 items-center gap-2 rounded-full border border-[var(--aparu-line)] bg-white px-3 py-1.5 text-left shadow-[0_4px_10px_rgba(24,39,75,0.04)]"
                  >
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--aparu-teal-soft)]/80 text-[var(--aparu-teal)]">
                      <Icon size={13} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[11px] font-medium leading-tight text-[var(--aparu-ink)]">{place.address}</span>
                      <span className="block truncate text-[10px] leading-tight text-[var(--aparu-muted)]">
                        {nearbyLabels[place.category]} · {Math.max(1, Math.round(place.distanceMeters / 100) / 10)} км
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Инфо о маршруте */}
        {routeLoading && (
          <div className="flex items-center gap-2 px-1">
            <Spinner className="h-4 w-4" />
            <span className="text-sm text-[var(--aparu-muted)]">Строим маршрут...</span>
          </div>
        )}
        {displayRoute && (
          <div className="flex gap-2">
            <div className="flex-1 rounded-[22px] bg-[var(--aparu-surface-soft)] px-3 py-2.5 text-center">
              <p className="text-xs text-[var(--aparu-muted)]">Расстояние</p>
              <p className="font-bold text-[var(--aparu-ink)]">{formatDistanceKm(displayRoute.distance)}</p>
            </div>
            <div className="flex-1 rounded-[22px] bg-[var(--aparu-surface-soft)] px-3 py-2.5 text-center">
              <p className="text-xs text-[var(--aparu-muted)]">Время</p>
              <p className="font-bold text-[var(--aparu-ink)]">{formatDurationMin(displayRoute.time)}</p>
            </div>
            <div className="flex-1 rounded-[22px] bg-[var(--aparu-orange-soft)] px-3 py-2.5 text-center">
              <p className="text-xs text-[var(--aparu-orange)]">По кратчайшему пути</p>
              <p className="font-bold text-[var(--aparu-orange)]">~{estimatePrice(displayRoute.distance, tariff)} ₸</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "economy", label: "Эконом", sub: "Дешевле" },
            { id: "standard", label: "Стандарт", sub: "Оптимально" },
            { id: "comfort", label: "Комфорт", sub: "Просторнее" },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setTariff(option.id as "economy" | "standard" | "comfort")}
              className={[
                "rounded-[20px] px-2 py-2.5 text-center transition-all",
                tariff === option.id
                  ? "bg-[var(--aparu-orange-soft)] text-[var(--aparu-orange)] shadow-[0_12px_24px_rgba(255,107,0,0.12)]"
                  : "bg-[var(--aparu-surface-soft)] text-[var(--aparu-muted)]",
              ].join(" ")}
            >
              <p className="text-[13px] font-semibold">{option.label}</p>
              <p className="mt-0.5 text-[10px]">{option.sub}</p>
            </button>
          ))}
        </div>

        {/* Способ оплаты */}
        <div className="flex gap-2">
          <button
            onClick={() => setPayment("cash")}
            className={[
              "flex h-12 flex-1 items-center justify-center gap-2 rounded-[22px] text-sm font-medium transition-all",
              payment === "cash"
                ? "bg-[var(--aparu-teal)] text-white shadow-[0_14px_28px_rgba(0,154,163,0.22)]"
                : "bg-[var(--aparu-surface-soft)] text-[var(--aparu-muted)]",
            ].join(" ")}
          >
            <CashWalletIcon size={18} />
            Наличные
          </button>
          <button
            onClick={() => setPayment("card")}
            className={[
              "flex h-12 flex-1 items-center justify-center gap-2 rounded-[22px] text-sm font-medium transition-all",
              payment === "card"
                ? "bg-[var(--aparu-teal)] text-white shadow-[0_14px_28px_rgba(0,154,163,0.22)]"
                : "bg-[var(--aparu-surface-soft)] text-[var(--aparu-muted)]",
            ].join(" ")}
          >
            <CardWalletIcon size={18} />
            Карта
          </button>
        </div>

        <div className="rounded-[22px] bg-[var(--aparu-surface-soft)] px-4 py-2.5">
          <p className="text-xs font-medium text-[var(--aparu-muted)]">Комментарий к заказу</p>
          <textarea
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Например: подъезд со стороны двора, буду в синей куртке"
            className="mt-1.5 w-full resize-none bg-transparent text-[14px] text-[var(--aparu-ink)] placeholder:text-[#9ca8ae] outline-none"
          />
        </div>

        {/* CTA */}
        {selectionMode ? (
          <div className="flex gap-2">
            <Button variant="secondary" size="lg" onClick={() => setSelectionMode(null)}>
              Отмена
            </Button>
            <Button size="lg" onClick={confirmPickedPoint} isLoading={pickingLoading}>
              Подтвердить точку
            </Button>
          </div>
        ) : (
          <Button size="lg" onClick={handleOrder} disabled={!canOrder}>
            Заказать такси
          </Button>
        )}
      </div>
    </div>
  );
}
