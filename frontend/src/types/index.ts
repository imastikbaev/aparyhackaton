// ─── QR Point ────────────────────────────────────────────────────────────────

export interface QRPoint {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

// ─── Driver ──────────────────────────────────────────────────────────────────

export interface Driver {
  id: number;
  name: string;
  car_model: string;
  car_color: string;
  car_number: string;
  rating: number;
}

// ─── Order ───────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "searching"
  | "driver_assigned"
  | "driver_arrived"
  | "trip_started"
  | "trip_completed"
  | "cancelled";

export type PaymentMethod = "cash" | "card";

export interface Order {
  id: number;
  status: OrderStatus;
  pickup_address: string;
  pickup_lat: number;
  pickup_lon: number;
  destination_address: string | null;
  destination_lat: number | null;
  destination_lon: number | null;
  tariff: string;
  payment_method: PaymentMethod;
  comment?: string | null;
  price_estimate: number | null;
  driver: Driver | null;
  eta_minutes: number | null;
  created_at: string;
}

export interface OrderCreate {
  qr_point_id: string;
  destination_address?: string;
  destination_lat?: number;
  destination_lon?: number;
  tariff?: string;
  payment_method?: PaymentMethod;
  comment?: string;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface OTPSendResponse {
  dev_code?: string | null;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  is_new_user: boolean;
}

// ─── Maps (Aparu Maps API) ───────────────────────────────────────────────────

export interface GeocodeResult {
  address: string;
  additionalInfo: string;
  latitude: number;
  longitude: number;
  type: "s" | "h" | "o" | "c";
}

export type NearbyPlaceCategory = "mall" | "pharmacy" | "hotel" | "hospital" | "cafe";

export interface NearbyPlace extends GeocodeResult {
  category: NearbyPlaceCategory;
  distanceMeters: number;
}

export interface GeocodeResponse {
  results: GeocodeResult[];
}

export interface ReverseGeocodeResponse {
  placeName: string;
  areaName: string;
  accuratePlace: boolean;
  locality: { localityId: number; name: string; latitude: number; longitude: number };
}

export interface RouteResponse {
  distance: number;      // метры
  time: number;          // миллисекунды
  coordinates: [number, number][]; // [lng, lat]
  bbox: [number, number, number, number];
  instructions?: Array<{
    distance: number;
    time: number;
    text: string;
    streetName: string;
    sign: number;
    interval: [number, number];
  }>;
}

// ─── WebSocket ───────────────────────────────────────────────────────────────

export interface WSStatusEvent {
  type: "status_update";
  order_id: number;
  status: OrderStatus;
  eta_minutes?: number;
}
