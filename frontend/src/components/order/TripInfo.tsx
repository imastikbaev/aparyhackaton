import { CashWalletIcon, CardWalletIcon } from "@/components/ui/AparuIcons";
import { RouteBadgeIcon } from "@/components/ui/AparuIcons";
import type { Order } from "@/types";

const TARIFF_LABELS: Record<string, string> = {
  economy: "Эконом",
  standard: "Стандарт",
  comfort: "Комфорт",
};

export function TripInfo({ order }: { order: Order }) {
  return (
    <div className="aparu-card space-y-3 p-4">
      {/* Точки маршрута */}
      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <RouteBadgeIcon label="A" tone="orange" size={28} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-[var(--aparu-orange)]">Откуда</p>
            <p className="text-[14px] font-medium text-[var(--aparu-ink)]">{order.pickup_address}</p>
          </div>
        </div>

        {order.destination_address && (
          <>
            <div className="ml-3.5 h-3 border-l-2 border-dashed border-[#dde5e8]" />
            <div className="flex items-start gap-3">
              <RouteBadgeIcon label="B" tone="teal" size={28} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-[var(--aparu-teal)]">Куда</p>
                <p className="text-[14px] font-medium text-[var(--aparu-ink)]">{order.destination_address}</p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="h-px bg-[var(--aparu-line)]" />

      {/* Тариф и оплата */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-[var(--aparu-muted)]">
          {order.payment_method === "cash" ? (
            <CashWalletIcon size={18} className="text-[var(--aparu-teal)]" />
          ) : (
            <CardWalletIcon size={18} className="text-[var(--aparu-teal)]" />
          )}
          <span>{order.payment_method === "cash" ? "Наличные" : "Карта"}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-[#9aa5ab]">{TARIFF_LABELS[order.tariff] ?? order.tariff}</span>
          {order.price_estimate && (
            <span className="text-[16px] font-bold text-[var(--aparu-ink)]">
              ~{Math.round(order.price_estimate)} ₸
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
