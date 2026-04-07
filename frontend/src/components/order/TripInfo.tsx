import { MapPin, Navigation } from "lucide-react";
import { CashWalletIcon, CardWalletIcon } from "@/components/ui/AparuIcons";
import type { Order } from "@/types";

const TARIFF_LABELS: Record<string, string> = {
  economy: "Эконом",
  standard: "Стандарт",
  comfort: "Комфорт",
};

export function TripInfo({ order }: { order: Order }) {
  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#F0F0F0] space-y-3">
      {/* Точки маршрута */}
      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 h-5 w-5 rounded-full bg-[#FF6B00] flex items-center justify-center flex-shrink-0">
            <MapPin size={11} color="white" />
          </div>
          <div>
            <p className="text-xs text-[#AAAAAA]">Откуда</p>
            <p className="text-[14px] font-medium text-[#1A1A1A]">{order.pickup_address}</p>
          </div>
        </div>

        {order.destination_address && (
          <>
            <div className="ml-2.5 border-l-2 border-dashed border-[#EBEBEB] h-3" />
            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-5 w-5 rounded-full bg-[#252525] flex items-center justify-center flex-shrink-0">
                <Navigation size={11} color="white" />
              </div>
              <div>
                <p className="text-xs text-[#AAAAAA]">Куда</p>
                <p className="text-[14px] font-medium text-[#1A1A1A]">{order.destination_address}</p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="h-px bg-[#F0F0F0]" />

      {/* Тариф и оплата */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-[#757575]">
          {order.payment_method === "cash" ? (
            <CashWalletIcon size={18} className="text-[#757575]" />
          ) : (
            <CardWalletIcon size={18} className="text-[#757575]" />
          )}
          <span>{order.payment_method === "cash" ? "Наличные" : "Карта"}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-[#AAAAAA]">{TARIFF_LABELS[order.tariff] ?? order.tariff}</span>
          {order.price_estimate && (
            <span className="font-bold text-[#1A1A1A] text-[16px]">
              ~{Math.round(order.price_estimate)} ₸
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
