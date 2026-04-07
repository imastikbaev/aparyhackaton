import type { Order, QRPoint } from "@/types";

export const DEMO_QR_ID = "demo";
export const DEMO_TOKEN = "demo-token";
export const DEMO_OTP_CODE = "1111";

const DEMO_DRIVER = {
  id: 1,
  name: "Айдар",
  car_model: "Hyundai Elantra",
  car_color: "Белый",
  car_number: "707 APA 02",
  rating: 4.9,
};

export const DEMO_QR_POINT: QRPoint = {
  id: DEMO_QR_ID,
  name: "Oskemen Hub",
  address: "ул. Казахстан 59/1, Oskemen Hub, Усть-Каменогорск",
  latitude: 49.949607,
  longitude: 82.627735,
};

export function isDemoQrId(qrId: string): boolean {
  return qrId === DEMO_QR_ID;
}

export function isDemoToken(token: string | null | undefined): boolean {
  return token === DEMO_TOKEN;
}

export function createDemoOrder(input: {
  destinationAddress?: string;
  destinationLat?: number;
  destinationLon?: number;
  paymentMethod?: "cash" | "card";
}): Order {
  return {
    id: Date.now(),
    status: "searching",
    pickup_address: DEMO_QR_POINT.address,
    pickup_lat: DEMO_QR_POINT.latitude,
    pickup_lon: DEMO_QR_POINT.longitude,
    destination_address: input.destinationAddress ?? "ул. Сатпаева 90, Алматы",
    destination_lat: input.destinationLat ?? 43.2365,
    destination_lon: input.destinationLon ?? 76.9284,
    tariff: "standard",
    payment_method: input.paymentMethod ?? "cash",
    price_estimate: 1350,
    driver: null,
    eta_minutes: 6,
    created_at: new Date().toISOString(),
  };
}

export function getDemoAssignedOrder(order: Order): Order {
  return {
    ...order,
    status: "driver_assigned",
    eta_minutes: 4,
    driver: DEMO_DRIVER,
  };
}
