import type { Order, OrderStatus } from "@/types";

export interface SharedTripPayload {
  orderId: number;
  createdAt: string;
  sharedAt: string;
  status: OrderStatus;
  pickup: {
    address: string;
    lat: number;
    lon: number;
  };
  destination: {
    address: string | null;
    lat: number | null;
    lon: number | null;
  };
  driver: Order["driver"];
  tariff: string;
  priceEstimate: number | null;
  etaMinutes: number | null;
}

export interface SharedTripState {
  status: OrderStatus;
  etaMinutes: number | null;
  driverPosition: { lat: number; lng: number } | null;
}

const PHASE_DURATIONS: Record<OrderStatus, number> = {
  searching: 2 * 60_000,
  driver_assigned: 4 * 60_000,
  driver_arrived: 60_000,
  trip_started: 12 * 60_000,
  trip_completed: 0,
  cancelled: 0,
};

const ORDER_FLOW: OrderStatus[] = [
  "searching",
  "driver_assigned",
  "driver_arrived",
  "trip_started",
  "trip_completed",
];

const TARIFFS = ["economy", "standard", "comfort"] as const;

type CompactSharedTripPayload = [
  number,
  number,
  number,
  number,
  string,
  number,
  number,
  string | null,
  number | null,
  number | null,
  [string, string, string, string, number] | null,
  number,
  number | null,
  number | null,
];

function toBase64Url(value: string): string {
  if (typeof window === "undefined") {
    return Buffer.from(value, "utf8").toString("base64url");
  }
  return btoa(unescape(encodeURIComponent(value)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value: string): string {
  if (typeof window === "undefined") {
    return Buffer.from(value, "base64url").toString("utf8");
  }

  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return decodeURIComponent(escape(atob(padded)));
}

function interpolate(start: { lat: number; lng: number }, end: { lat: number; lng: number }, progress: number) {
  return {
    lat: start.lat + (end.lat - start.lat) * progress,
    lng: start.lng + (end.lng - start.lng) * progress,
  };
}

function roundCoord(value: number | null): number | null {
  return value == null ? null : Number(value.toFixed(5));
}

function compactPayload(payload: SharedTripPayload): CompactSharedTripPayload {
  return [
    payload.orderId,
    new Date(payload.createdAt).getTime(),
    new Date(payload.sharedAt).getTime(),
    Math.max(0, ORDER_FLOW.indexOf(payload.status)),
    payload.pickup.address,
    roundCoord(payload.pickup.lat) ?? payload.pickup.lat,
    roundCoord(payload.pickup.lon) ?? payload.pickup.lon,
    payload.destination.address,
    roundCoord(payload.destination.lat),
    roundCoord(payload.destination.lon),
    payload.driver
      ? [
          payload.driver.name,
          payload.driver.car_model,
          payload.driver.car_color,
          payload.driver.car_number,
          Number(payload.driver.rating.toFixed(1)),
        ]
      : null,
    Math.max(0, TARIFFS.indexOf((payload.tariff as (typeof TARIFFS)[number]) ?? "standard")),
    payload.priceEstimate != null ? Math.round(payload.priceEstimate) : null,
    payload.etaMinutes,
  ];
}

function expandPayload(compact: CompactSharedTripPayload): SharedTripPayload {
  const [
    orderId,
    createdAtMs,
    sharedAtMs,
    statusIndex,
    pickupAddress,
    pickupLat,
    pickupLon,
    destinationAddress,
    destinationLat,
    destinationLon,
    driver,
    tariffIndex,
    priceEstimate,
    etaMinutes,
  ] = compact;

  return {
    orderId,
    createdAt: new Date(createdAtMs).toISOString(),
    sharedAt: new Date(sharedAtMs).toISOString(),
    status: ORDER_FLOW[statusIndex] ?? "driver_assigned",
    pickup: {
      address: pickupAddress,
      lat: pickupLat,
      lon: pickupLon,
    },
    destination: {
      address: destinationAddress,
      lat: destinationLat,
      lon: destinationLon,
    },
    driver: driver
      ? {
          id: 1,
          name: driver[0],
          car_model: driver[1],
          car_color: driver[2],
          car_number: driver[3],
          rating: driver[4],
        }
      : null,
    tariff: TARIFFS[tariffIndex] ?? "standard",
    priceEstimate,
    etaMinutes,
  };
}

function getApproachStartPoint(payload: SharedTripPayload) {
  const seed = ((payload.orderId % 17) + 17) % 17;
  const latOffset = 0.004 + seed * 0.00008;
  const lngOffset = 0.0025 + seed * 0.00005;
  return {
    lat: payload.pickup.lat + latOffset,
    lng: payload.pickup.lon - lngOffset,
  };
}

export function createSharedTripPayload(order: Order): SharedTripPayload {
  return {
    orderId: order.id,
    createdAt: order.created_at,
    sharedAt: new Date().toISOString(),
    status: order.status,
    pickup: {
      address: order.pickup_address,
      lat: order.pickup_lat,
      lon: order.pickup_lon,
    },
    destination: {
      address: order.destination_address,
      lat: order.destination_lat,
      lon: order.destination_lon,
    },
    driver: order.driver,
    tariff: order.tariff,
    priceEstimate: order.price_estimate,
    etaMinutes: order.eta_minutes,
  };
}

export function encodeSharedTripPayload(payload: SharedTripPayload): string {
  return toBase64Url(JSON.stringify(compactPayload(payload)));
}

export function decodeSharedTripPayload(token: string): SharedTripPayload | null {
  try {
    const parsed = JSON.parse(fromBase64Url(token)) as SharedTripPayload | CompactSharedTripPayload;
    return Array.isArray(parsed) ? expandPayload(parsed as CompactSharedTripPayload) : parsed;
  } catch {
    return null;
  }
}

export function getSharedTripUrl(payload: SharedTripPayload, origin: string): string {
  return `${origin}/share/${encodeSharedTripPayload(payload)}`;
}

export function getSharedTripState(
  payload: SharedTripPayload,
  now = Date.now(),
): SharedTripState {
  const initialIndex = Math.max(0, ORDER_FLOW.indexOf(payload.status));
  let elapsed = Math.max(0, now - new Date(payload.sharedAt).getTime());
  let status = payload.status;

  for (let index = initialIndex; index < ORDER_FLOW.length - 1; index += 1) {
    const current = ORDER_FLOW[index];
    const duration = PHASE_DURATIONS[current];

    if (duration <= 0) {
      status = ORDER_FLOW[index + 1];
      continue;
    }

    if (elapsed < duration) {
      status = current;
      break;
    }

    elapsed -= duration;
    status = ORDER_FLOW[index + 1];
  }

  const approachStart = getApproachStartPoint(payload);
  const pickup = { lat: payload.pickup.lat, lng: payload.pickup.lon };
  const destination =
    payload.destination.lat != null && payload.destination.lon != null
      ? { lat: payload.destination.lat, lng: payload.destination.lon }
      : pickup;

  if (status === "searching") {
    return { status, etaMinutes: 6, driverPosition: null };
  }

  if (status === "driver_assigned") {
    const phaseProgress = Math.min(1, elapsed / PHASE_DURATIONS.driver_assigned);
    const remainingMs = PHASE_DURATIONS.driver_assigned - elapsed;
    return {
      status,
      etaMinutes: Math.max(1, Math.ceil(remainingMs / 60_000)),
      driverPosition: interpolate(approachStart, pickup, phaseProgress),
    };
  }

  if (status === "driver_arrived") {
    return {
      status,
      etaMinutes: 0,
      driverPosition: pickup,
    };
  }

  if (status === "trip_started") {
    const phaseProgress = Math.min(1, elapsed / PHASE_DURATIONS.trip_started);
    const remainingMs = PHASE_DURATIONS.trip_started - elapsed;
    return {
      status,
      etaMinutes: Math.max(1, Math.ceil(remainingMs / 60_000)),
      driverPosition: interpolate(pickup, destination, phaseProgress),
    };
  }

  return {
    status,
    etaMinutes: 0,
    driverPosition: destination,
  };
}
