import type { Order, OrderStop, QRPoint } from "@/types";
import { estimateDistanceMeters, estimatePrice } from "@/lib/pricing";

export const DEMO_QR_ID = "demo";
export const DEMO_TOKEN = "demo-token";
export const DEMO_OTP_CODE = "1111";

const DEMO_DRIVERS: Record<string, { id: number; name: string; car_model: string; car_color: string; car_number: string; rating: number }> = {
  economy: {
    id: 1,
    name: "Даурен К.",
    car_model: "Lada Priora",
    car_color: "Серебристый",
    car_number: "458 КА 01",
    rating: 4.7,
  },
  standard: {
    id: 2,
    name: "Сергей Н.",
    car_model: "Chevrolet Cobalt",
    car_color: "Белый",
    car_number: "221 АВ 01",
    rating: 4.8,
  },
  comfort: {
    id: 3,
    name: "Алексей М.",
    car_model: "Toyota Camry",
    car_color: "Чёрный",
    car_number: "777 АА 01",
    rating: 4.9,
  },
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
  stopovers?: OrderStop[];
  paymentMethod?: "cash" | "card";
  tariff?: string;
  comment?: string;
}): Order {
  const destinationLat = input.destinationLat ?? 49.9528653;
  const destinationLon = input.destinationLon ?? 82.6323419;
  const tariff = input.tariff ?? "standard";
  const routeStops = input.stopovers ?? [];
  const routePoints = [
    { latitude: DEMO_QR_POINT.latitude, longitude: DEMO_QR_POINT.longitude },
    ...routeStops.map((stop) => ({ latitude: stop.latitude, longitude: stop.longitude })),
    { latitude: destinationLat, longitude: destinationLon },
  ];
  const distanceMeters = routePoints.slice(1).reduce((total, point, index) => {
    const previous = routePoints[index];
    return total + estimateDistanceMeters(previous, point);
  }, 0);

  return {
    id: Date.now(),
    status: "searching",
    pickup_address: DEMO_QR_POINT.address,
    pickup_lat: DEMO_QR_POINT.latitude,
    pickup_lon: DEMO_QR_POINT.longitude,
    destination_address: input.destinationAddress ?? "Қазақстан көшесі, 76, Усть-Каменогорск",
    destination_lat: destinationLat,
    destination_lon: destinationLon,
    stopovers: routeStops,
    tariff,
    payment_method: input.paymentMethod ?? "cash",
    comment: input.comment ?? null,
    price_estimate: estimatePrice(distanceMeters, tariff),
    driver: null,
    eta_minutes: 6,
    created_at: new Date().toISOString(),
  };
}

export function getDemoAssignedOrder(order: Order): Order {
  const driver = DEMO_DRIVERS[order.tariff ?? "standard"] ?? DEMO_DRIVERS.standard;
  return {
    ...order,
    status: "driver_assigned",
    eta_minutes: order.tariff === "economy" ? 3 : order.tariff === "comfort" ? 7 : 4,
    driver,
  };
}
