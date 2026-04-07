import { Car, Star } from "lucide-react";
import type { Driver } from "@/types";

interface DriverCardProps {
  driver: Driver;
  etaMinutes?: number | null;
}

export function DriverCard({ driver, etaMinutes }: DriverCardProps) {
  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#F0F0F0]">
      <div className="flex items-center gap-3">
        {/* Аватар */}
        <div className="h-12 w-12 rounded-full bg-[#F5F5F5] flex items-center justify-center text-lg font-bold text-[#1A1A1A]">
          {driver.name[0]}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#1A1A1A] text-[15px] truncate">{driver.name}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <Car size={13} color="#AAAAAA" />
            <p className="text-sm text-[#757575] truncate">
              {driver.car_model} · {driver.car_color}
            </p>
          </div>
        </div>

        {/* Рейтинг */}
        <div className="flex items-center gap-1 bg-[#F5F5F5] rounded-xl px-2.5 py-1">
          <Star size={13} color="#FF6B00" fill="#FF6B00" />
          <span className="text-sm font-semibold text-[#1A1A1A]">{driver.rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Номер авто */}
      <div className="mt-3 flex items-center justify-between bg-[#F5F5F5] rounded-2xl px-4 py-2.5">
        <span className="text-sm text-[#757575]">Гос. номер</span>
        <span className="font-mono font-bold text-[#1A1A1A] tracking-wider text-[15px]">
          {driver.car_number}
        </span>
      </div>

      {etaMinutes != null && (
        <p className="mt-2.5 text-center text-sm text-[#757575]">
          Прибудет через{" "}
          <span className="font-semibold text-[#FF6B00]">{etaMinutes} мин</span>
        </p>
      )}
    </div>
  );
}
