"use client";

import { useEffect, useRef, useState } from "react";

interface MarkerConfig {
  lat: number;
  lng: number;
  color: "orange" | "dark";
  label?: string;
}

interface LeafletMapProps {
  center: [number, number];
  zoom?: number;
  markers?: MarkerConfig[];
  /** Координаты маршрута в формате [lat, lng] */
  routeCoords?: [number, number][];
  className?: string;
}

// APARU фирменные маркеры — PNG из дизайна
const PIN_URLS = {
  orange: "/aparu/pin-a.png",
  dark:   "/aparu/pin-b.png",
} as const;

export function LeafletMap({
  center,
  zoom = 15,
  markers = [],
  routeCoords = [],
  className = "",
}: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const overlayRef = useRef<any[]>([]);
  // Флаг готовности карты — триггерит перерисовку маркеров
  const [mapReady, setMapReady] = useState(false);

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
        map.fitBounds(poly.getBounds(), { padding: [60, 60] });
      }

      markers.forEach(({ lat, lng, color, label }) => {
        const icon = L.icon({
          iconUrl: PIN_URLS[color],
          iconSize: [40, 40],
          iconAnchor: [20, 40],
          popupAnchor: [0, -40],
        });
        const m = L.marker([lat, lng], { icon }).addTo(map);
        if (label) m.bindPopup(label);
        overlayRef.current.push(m);
      });

      if (markers.length >= 1 && routeCoords.length === 0) {
        map.setView([markers[0].lat, markers[0].lng], zoom);
      }
    });
  }, [mapReady, markers, routeCoords, zoom]);

  return <div ref={containerRef} className={className} />;
}
