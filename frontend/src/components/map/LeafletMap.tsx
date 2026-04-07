"use client";

import { useEffect, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CarFront } from "lucide-react";

interface MarkerConfig {
  lat: number;
  lng: number;
  color?: "orange" | "dark";
  kind?: "route-a" | "route-b" | "driver";
  label?: string;
}

interface LeafletMapProps {
  center: [number, number];
  zoom?: number;
  markers?: MarkerConfig[];
  /** Координаты маршрута в формате [lat, lng] */
  routeCoords?: [number, number][];
  className?: string;
  onMoveEnd?: (center: [number, number]) => void;
  autoFitRoute?: boolean;
}

// APARU фирменные маркеры — PNG из дизайна
const PIN_URLS = {
  orange: "/aparu/pin-a.png",
  dark:   "/aparu/pin-b.png",
} as const;

const ROUTE_PIN_URLS = {
  "route-a": "/aparu/route-a.png",
  "route-b": "/aparu/route-b.png",
} as const;

export function LeafletMap({
  center,
  zoom = 15,
  markers = [],
  routeCoords = [],
  className = "",
  onMoveEnd,
  autoFitRoute = true,
}: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const overlayRef = useRef<any[]>([]);
  const onMoveEndRef = useRef(onMoveEnd);
  // Флаг готовности карты — триггерит перерисовку маркеров
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    onMoveEndRef.current = onMoveEnd;
  }, [onMoveEnd]);

  // Инициализация карты (один раз)
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let destroyed = false;
    import("leaflet").then((L) => {
      if (destroyed || !containerRef.current) return;
      const map = L.map(containerRef.current, {
        center,
        zoom,
        zoomControl: false,
        attributionControl: false,
      });
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);
      map.on("moveend", () => {
        const current = map.getCenter();
        onMoveEndRef.current?.([current.lat, current.lng]);
      });
      mapRef.current = map;
      // Сообщаем React что карта готова → запускает эффект маркеров
      setMapReady(true);
    });

    return () => {
      destroyed = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Обновление маркеров и маршрута
  // mapReady в зависимостях гарантирует запуск ПОСЛЕ инициализации карты
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;

    overlayRef.current.forEach((layer) => layer.remove());
    overlayRef.current = [];

    import("leaflet").then((L) => {
      if (!mapRef.current) return;

      if (routeCoords.length > 1) {
        const poly = L.polyline(routeCoords, {
          color: "#FF6B00",
          weight: 5,
          opacity: 0.85,
        }).addTo(map);
        overlayRef.current.push(poly);
        if (autoFitRoute) {
          map.fitBounds(poly.getBounds(), { padding: [60, 60] });
        }
      }

      markers.forEach(({ lat, lng, color = "dark", kind, label }) => {
        const icon =
          kind === "driver"
            ? L.divIcon({
                className: "",
                html: renderToStaticMarkup(
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "16px",
                      background: "white",
                      boxShadow: "0 10px 24px rgba(24,39,75,0.18)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid rgba(233,238,240,1)",
                    }}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "12px",
                        background: "#009AA3",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CarFront size={18} strokeWidth={2.2} />
                    </div>
                  </div>,
                ),
                iconSize: [44, 44],
                iconAnchor: [22, 22],
                popupAnchor: [0, -22],
              })
            : L.icon({
                iconUrl: kind ? ROUTE_PIN_URLS[kind] : PIN_URLS[color],
                iconSize: kind ? [40, 40] : [40, 40],
                iconAnchor: kind ? [20, 20] : [20, 40],
                popupAnchor: kind ? [0, -20] : [0, -40],
              });
        const m = L.marker([lat, lng], { icon }).addTo(map);
        if (label) m.bindPopup(label);
        overlayRef.current.push(m);
      });
    });
  }, [autoFitRoute, mapReady, markers, routeCoords, zoom]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    const current = map.getCenter();
    const latDiff = Math.abs(current.lat - center[0]);
    const lngDiff = Math.abs(current.lng - center[1]);
    if (latDiff > 0.0001 || lngDiff > 0.0001) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, mapReady]);

  return <div ref={containerRef} className={className} />;
}
