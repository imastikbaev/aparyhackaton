"use client";

import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { MapPin, Navigation, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { CashWalletIcon, CardWalletIcon } from "@/components/ui/AparuIcons";
import { buildRoute, geocodeAddress, getQRPoint } from "@/lib/api";
import { formatDistanceKm, formatDurationMin } from "@/lib/utils";
import { useOrderStore } from "@/store/orderStore";
import type { GeocodeResult, PaymentMethod, QRPoint, RouteResponse } from "@/types";

const LeafletMap = dynamic(
  () => import("@/components/map/LeafletMap").then((m) => m.LeafletMap),
  { ssr: false, loading: () => <div className="h-full bg-[#E8F0EE]" /> },
);

export default function ScanPage() {
  const { qrId } = useParams<{ qrId: string }>();
  const router = useRouter();
  const { token, setQRPoint } = useOrderStore();

  const [qrPoint, setQrPointLocal] = useState<QRPoint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Маршрут и назначение
  const [destQuery, setDestQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [selectedDest, setSelectedDest] = useState<GeocodeResult | null>(null);
  const [route, setRoute] = useState<RouteResponse | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [payment, setPayment] = useState<PaymentMethod>("cash");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Загружаем QR-точку
  useEffect(() => {
    getQRPoint(qrId)
      .then((p) => { setQrPointLocal(p); setQRPoint(p); })
      .catch(() => setError("QR-код не найден или недействителен"))
      .finally(() => setLoading(false));
  }, [qrId, setQRPoint]);

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
          const res = await geocodeAddress(val, qrPoint.latitude, qrPoint.longitude);
          setSuggestions(res.results.slice(0, 5));
        } catch { /* silent */ }
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

      setRouteLoading(true);
      try {
        const r = await buildRoute([
          { latitude: qrPoint.latitude, longitude: qrPoint.longitude },
          { latitude: item.latitude, longitude: item.longitude },
        ]);
        setRoute(r);
      } catch { /* silent */ } finally {
        setRouteLoading(false);
      }
    },
    [qrPoint],
  );

  const handleOrder = () => {
    if (!token) {
      router.push(`/verify?next=/scan/${qrId}`);
    } else {
      useOrderStore.setState({
        pendingOrder: {
          qr_point_id: qrId,
          destination_address: selectedDest ? `${selectedDest.address}, ${selectedDest.additionalInfo}` : undefined,
          destination_lat: selectedDest?.latitude,
          destination_lon: selectedDest?.longitude,
          payment_method: payment,
        },
      });
      router.push(`/confirm?qr=${qrId}`);
    }
  };

  // Маркеры карты
  const markers = qrPoint
    ? [
        { lat: qrPoint.latitude, lng: qrPoint.longitude, color: "orange" as const, label: qrPoint.name },
        ...(selectedDest
          ? [{ lat: selectedDest.latitude, lng: selectedDest.longitude, color: "dark" as const, label: selectedDest.address }]
          : []),
      ]
    : [];

  const routeCoords: [number, number][] = route
    ? route.coordinates.map(([lng, lat]) => [lat, lng])
    : [];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <Spinner />
      </div>
    );
  }

  if (error || !qrPoint) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-white">
        <MapPin size={48} color="#AAAAAA" />
        <p className="font-semibold text-[#1A1A1A] text-lg">QR-код не найден</p>
        <p className="text-sm text-[#757575]">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-[430px] mx-auto bg-white overflow-hidden">
      {/* Карта (верхняя часть) */}
      <div className="relative flex-1 min-h-0">
        <LeafletMap
          center={[qrPoint.latitude, qrPoint.longitude]}
          zoom={15}
          markers={markers}
          routeCoords={routeCoords}
          className="h-full w-full"
        />

        {/* Лого поверх карты */}
        <div className="absolute top-4 left-4 bg-white rounded-2xl px-4 py-2.5 shadow-md z-[1000]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/aparu/logo.svg" alt="APARU" className="h-5 w-auto" />
        </div>
      </div>

      {/* Bottom Sheet */}
      <div className="bg-white rounded-t-3xl shadow-[0_-4px_24px_rgba(0,0,0,0.08)] px-4 pt-3 pb-6 flex flex-col gap-3">
        {/* Drag handle */}
        <div className="w-10 h-1 bg-[#EBEBEB] rounded-full mx-auto mb-1" />

        {/* Точка А — откуда */}
        <div className="flex items-center gap-3 bg-[#FFF5EE] rounded-2xl px-4 py-3">
          <div className="h-8 w-8 rounded-full bg-[#FF6B00] flex items-center justify-center flex-shrink-0">
            <MapPin size={16} color="white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#FF6B00] font-medium">Откуда</p>
            <p className="text-[14px] font-semibold text-[#1A1A1A] truncate">{qrPoint.name}</p>
            <p className="text-xs text-[#757575] truncate">{qrPoint.address}</p>
          </div>
        </div>

        {/* Точка Б — куда */}
        <div className="relative">
          <div className="flex items-center gap-3 bg-[#F5F5F5] rounded-2xl px-4 py-3">
            <div className="h-8 w-8 rounded-full bg-[#252525] flex items-center justify-center flex-shrink-0">
              <Navigation size={16} color="white" />
            </div>
            <input
              type="text"
              placeholder="Куда едем?"
              value={destQuery}
              onChange={(e) => handleDestInput(e.target.value)}
              className="flex-1 bg-transparent text-[14px] text-[#1A1A1A] placeholder:text-[#AAAAAA] outline-none font-medium"
            />
            {destQuery && (
              <button onClick={() => { setDestQuery(""); setSelectedDest(null); setRoute(null); setSuggestions([]); }}>
                <X size={16} color="#AAAAAA" />
              </button>
            )}
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white rounded-2xl shadow-lg border border-[#F0F0F0] mt-1 z-10 overflow-hidden">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => selectDest(s)}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-[#F5F5F5] text-left border-b border-[#F5F5F5] last:border-0"
                >
                  <MapPin size={16} color="#AAAAAA" className="mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[14px] font-medium text-[#1A1A1A]">{s.address}</p>
                    <p className="text-xs text-[#757575]">{s.additionalInfo}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Инфо о маршруте */}
        {routeLoading && (
          <div className="flex items-center gap-2 px-1">
            <Spinner className="h-4 w-4" />
            <span className="text-sm text-[#757575]">Строим маршрут...</span>
          </div>
        )}
        {route && (
          <div className="flex gap-2">
            <div className="flex-1 bg-[#F5F5F5] rounded-2xl px-3 py-2 text-center">
              <p className="text-xs text-[#757575]">Расстояние</p>
              <p className="font-bold text-[#1A1A1A]">{formatDistanceKm(route.distance)}</p>
            </div>
            <div className="flex-1 bg-[#F5F5F5] rounded-2xl px-3 py-2 text-center">
              <p className="text-xs text-[#757575]">Время</p>
              <p className="font-bold text-[#1A1A1A]">{formatDurationMin(route.time)}</p>
            </div>
            <div className="flex-1 bg-[#FFF5EE] rounded-2xl px-3 py-2 text-center">
              <p className="text-xs text-[#FF6B00]">Стоимость</p>
              <p className="font-bold text-[#FF6B00]">~{Math.round(route.distance / 1000 * 120 + 350)} ₸</p>
            </div>
          </div>
        )}

        {/* Способ оплаты */}
        <div className="flex gap-2">
          <button
            onClick={() => setPayment("cash")}
            className={[
              "flex-1 flex items-center justify-center gap-2 h-11 rounded-2xl text-sm font-medium transition-all",
              payment === "cash"
                ? "bg-[#FF6B00] text-white"
                : "bg-[#F5F5F5] text-[#757575]",
            ].join(" ")}
          >
            <CashWalletIcon size={18} />
            Наличные
          </button>
          <button
            onClick={() => setPayment("card")}
            className={[
              "flex-1 flex items-center justify-center gap-2 h-11 rounded-2xl text-sm font-medium transition-all",
              payment === "card"
                ? "bg-[#FF6B00] text-white"
                : "bg-[#F5F5F5] text-[#757575]",
            ].join(" ")}
          >
            <CardWalletIcon size={18} />
            Карта
          </button>
        </div>

        {/* CTA */}
        <Button size="lg" onClick={handleOrder}>
          Заказать такси
        </Button>
      </div>
    </div>
  );
}
