import { Car, Star } from "lucide-react";
import type { Driver } from "@/types";

interface DriverCardProps {
  driver: Driver;
  etaMinutes?: number | null;
}

export function DriverCard({ driver, etaMinutes }: DriverCardProps) {
  return (
    <div className="aparu-card p-4">
      <div className="flex items-center gap-3">
        {/* Аватар */}
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--aparu-orange-soft)] text-lg font-bold text-[var(--aparu-orange)]">
          {driver.name[0]}
        </div>

        <div className="flex-1 min-w-0">
          <p className="truncate text-[15px] font-semibold text-[var(--aparu-ink)]">{driver.name}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <Car size={13} color="#96A2A8" />
            <p className="truncate text-sm text-[var(--aparu-muted)]">
              {driver.car_model} · {driver.car_color}
            </p>
          </div>
        </div>

        {/* Рейтинг */}
        <div className="flex items-center gap-1 rounded-xl bg-[var(--aparu-surface-soft)] px-2.5 py-1">
          <Star size={13} color="#FF6B00" fill="#FF6B00" />
          <span className="text-sm font-semibold text-[var(--aparu-ink)]">{driver.rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Номер авто */}
      <div className="mt-3 flex items-center justify-between rounded-[22px] bg-[var(--aparu-surface-soft)] px-4 py-2.5">
        <span className="text-sm text-[var(--aparu-muted)]">Гос. номер</span>
        <span className="font-mono text-[15px] font-bold tracking-wider text-[var(--aparu-ink)]">
          {driver.car_number}
        </span>
      </div>

      {etaMinutes != null && (
        <p className="mt-2.5 text-center text-sm text-[var(--aparu-muted)]">
          Прибудет через{" "}
          <span className="font-semibold text-[var(--aparu-orange)]">{etaMinutes} мин</span>
        </p>
      )}
    </div>
  );
}
