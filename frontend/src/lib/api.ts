import type {
  GeocodeResponse,
  OTPSendResponse,
  Order,
  OrderCreate,
  QRPoint,
  ReverseGeocodeResponse,
  RouteResponse,
  AdminOrder,
  TokenResponse,
} from "@/types";
import { createDemoOrder, DEMO_QR_POINT, isDemoQrId, isDemoToken } from "@/lib/demo";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
const MAPS_BASE_URL = "/api/v1/maps";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, ...init } = options;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, body.detail ?? "Ошибка запроса");
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

async function mapsRequest<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${MAPS_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, data.detail ?? "Ошибка Maps API");
  }

  return res.json() as Promise<T>;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const sendOTP = (phone: string) =>
  request<OTPSendResponse>("/auth/send-otp", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });

export const verifyOTP = (phone: string, code: string) =>
  request<TokenResponse>("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ phone, code }),
  });

// ─── QR ──────────────────────────────────────────────────────────────────────

export const getQRPoint = (qrId: string) =>
  isDemoQrId(qrId) ? Promise.resolve(DEMO_QR_POINT) : request<QRPoint>(`/qr/${qrId}`);

// ─── Orders ──────────────────────────────────────────────────────────────────

export const createOrder = (data: OrderCreate, token: string) =>
  isDemoToken(token) || isDemoQrId(data.qr_point_id)
    ? Promise.resolve(
        createDemoOrder({
          destinationAddress: data.destination_address,
          destinationLat: data.destination_lat,
          destinationLon: data.destination_lon,
          stopovers: data.stopovers,
          paymentMethod: data.payment_method,
          tariff: data.tariff,
          comment: data.comment,
        }),
      )
    : request<Order>("/orders", {
        method: "POST",
        body: JSON.stringify({
          qr_point_id: data.qr_point_id,
          destination_address: data.destination_address,
          destination_lat: data.destination_lat,
          destination_lon: data.destination_lon,
          tariff: data.tariff,
          payment_method: data.payment_method,
        }),
        token,
      });

export const getOrder = (orderId: number, token: string) =>
  request<Order>(`/orders/${orderId}`, { token });

export const cancelOrder = (orderId: number, token: string) =>
  request<Order>(`/orders/${orderId}/cancel`, { method: "POST", token });

export const getAdminOrders = (key: string, limit = 100) =>
  request<AdminOrder[]>(`/admin/orders?key=${encodeURIComponent(key)}&limit=${limit}`);

// ─── Maps (прокси через наш бэкенд) ─────────────────────────────────────────

export const geocodeAddress = (text: string, lat: number, lng: number) =>
  mapsRequest<GeocodeResponse>("/geocode", {
    text,
    latitude: lat,
    longitude: lng,
    withCities: true,
  });

export const reverseGeocode = (lat: number, lng: number) =>
  mapsRequest<ReverseGeocodeResponse>("/reverse-geocode", {
    latitude: lat,
    longitude: lng,
  });

export const buildRoute = (
  points: Array<{ latitude: number; longitude: number }>,
) =>
  mapsRequest<RouteResponse>("/route", { points });

// ─── WebSocket ───────────────────────────────────────────────────────────────

export const getOrderWsUrl = (orderId: number): string => {
  const wsBase = (process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000/api/v1").replace(
    /^http/,
    "ws",
  );
  return `${wsBase}/ws/orders/${orderId}`;
};
