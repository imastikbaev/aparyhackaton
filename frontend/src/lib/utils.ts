import type { OrderStatus } from "@/types";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  searching: "Ищем водителя",
  driver_assigned: "Водитель едет к вам",
  driver_arrived: "Водитель прибыл",
  trip_started: "Поездка началась",
  trip_completed: "Поездка завершена",
  cancelled: "Заказ отменён",
};

export const ORDER_STATUS_STEPS: OrderStatus[] = [
  "searching",
  "driver_assigned",
  "driver_arrived",
  "trip_started",
  "trip_completed",
];

export function getStepIndex(status: OrderStatus): number {
  return ORDER_STATUS_STEPS.indexOf(status);
}

export function formatDistanceKm(meters: number): string {
  return `${(meters / 1000).toFixed(1)} км`;
}

export function formatDurationMin(ms: number): string {
  return `${Math.ceil(ms / 60000)} мин`;
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
