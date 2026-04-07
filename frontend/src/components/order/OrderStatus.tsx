"use client";

import { Car, CheckCircle, MapPin, Navigation, Search } from "lucide-react";
import { ORDER_STATUS_LABELS, ORDER_STATUS_STEPS, getStepIndex } from "@/lib/utils";
import type { OrderStatus as TOrderStatus } from "@/types";

const STEP_ICONS = [Search, Car, MapPin, Navigation, CheckCircle];

export function OrderStatusBar({ status }: { status: TOrderStatus }) {
  const currentIndex = getStepIndex(status);
  const steps = ORDER_STATUS_STEPS;

  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#F0F0F0]">
      {/* Текущий статус */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
          {(() => {
            const Icon = STEP_ICONS[Math.max(0, currentIndex)] ?? Car;
            return <Icon size={20} color="#FF6B00" />;
          })()}
        </div>
        <div>
          <p className="font-semibold text-[#1A1A1A]">{ORDER_STATUS_LABELS[status]}</p>
        </div>
      </div>

      {/* Прогресс */}
      <div className="flex items-center gap-1.5">
        {steps.map((_, i) => (
          <div
            key={i}
            className={[
              "flex-1 h-1.5 rounded-full transition-all duration-500",
              i <= currentIndex ? "bg-[#FF6B00]" : "bg-[#EBEBEB]",
            ].join(" ")}
          />
        ))}
      </div>
    </div>
  );
}
