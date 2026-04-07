import type {
  GeocodeResponse,
  OTPSendResponse,
  Order,
  OrderCreate,
  QRPoint,
  ReverseGeocodeResponse,
  RouteResponse,
  TokenResponse,
} from "@/types";
import { createDemoOrder, DEMO_QR_POINT, isDemoQrId, isDemoToken } from "@/lib/demo";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

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
          paymentMethod: data.payment_method,
          tariff: data.tariff,
          comment: data.comment,
        }),
      )
    : request<Order>("/orders", { method: "POST", body: JSON.stringify(data), token });

export const getOrder = (orderId: number, token: string) =>
  request<Order>(`/orders/${orderId}`, { token });

// ─── Maps (прокси через наш бэкенд) ─────────────────────────────────────────

export const geocodeAddress = (text: string, lat: number, lng: number) =>
  request<GeocodeResponse>("/maps/geocode", {
    method: "POST",
    body: JSON.stringify({ text, latitude: lat, longitude: lng, withCities: true }),
  });

export const reverseGeocode = (lat: number, lng: number) =>
  request<ReverseGeocodeResponse>("/maps/reverse-geocode", {
    method: "POST",
    body: JSON.stringify({ latitude: lat, longitude: lng }),
  });

export const buildRoute = (
  points: Array<{ latitude: number; longitude: number }>,
) =>
  request<RouteResponse>("/maps/route", {
    method: "POST",
    body: JSON.stringify({ points }),
  });

// ─── WebSocket ───────────────────────────────────────────────────────────────

export const getOrderWsUrl = (orderId: number): string => {
  const wsBase = (process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000/api/v1").replace(
    /^http/,
    "ws",
  );
  return `${wsBase}/ws/orders/${orderId}`;
};
