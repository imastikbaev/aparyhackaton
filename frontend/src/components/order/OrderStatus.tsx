"use client";

import { Car, CheckCircle, MapPin, Navigation, Search } from "lucide-react";
import { ORDER_STATUS_LABELS, ORDER_STATUS_STEPS, getStepIndex } from "@/lib/utils";
import type { OrderStatus as TOrderStatus } from "@/types";

const STEP_ICONS = [Search, Car, MapPin, Navigation, CheckCircle];

export function OrderStatusBar({ status }: { status: TOrderStatus }) {
  const currentIndex = getStepIndex(status);
  const steps = ORDER_STATUS_STEPS;

  return (
    <div className="aparu-card p-4">
      {/* Текущий статус */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--aparu-orange-soft)]">
          {(() => {
            const Icon = STEP_ICONS[Math.max(0, currentIndex)] ?? Car;
            return <Icon size={20} color="#FF6B00" />;
          })()}
        </div>
        <div>
          <p className="font-semibold text-[var(--aparu-ink)]">{ORDER_STATUS_LABELS[status]}</p>
        </div>
      </div>

      {/* Прогресс */}
      <div className="flex items-center gap-1.5">
        {steps.map((_, i) => (
          <div
            key={i}
            className={[
              "h-2 flex-1 rounded-full transition-all duration-500",
              i <= currentIndex ? "bg-[var(--aparu-teal)]" : "bg-[#e3eaed]",
            ].join(" ")}
          />
        ))}
      </div>
    </div>
  );
}
