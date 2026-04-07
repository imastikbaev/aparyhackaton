"use client";

import { useRouter } from "next/navigation";
import { CheckCircle, Download, Star } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { MenuTileIcon } from "@/components/ui/AparuIcons";
import { useOrderStore } from "@/store/orderStore";

export default function CompletePage() {
  const { currentQRPoint, currentOrder, reset } = useOrderStore();
  const router = useRouter();

  const handleReorder = () => {
    reset();
    if (currentQRPoint) router.push(`/scan/${currentQRPoint.id}`);
    else router.push("/");
  };

  return (
    <AppShell>
      <div className="flex flex-col items-center px-4 pt-12 pb-8 gap-6 min-h-screen">

        {/* Успех */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="aparu-card flex h-24 w-24 items-center justify-center rounded-[32px]">
            <CheckCircle size={42} color="#009AA3" />
          </div>
          <h1 className="text-[24px] font-bold text-[var(--aparu-ink)]">Поездка завершена!</h1>
          <p className="text-[14px] text-[var(--aparu-muted)]">Спасибо, что воспользовались APARU</p>
        </div>

        {/* Итого */}
        {currentOrder?.price_estimate && (
          <div className="w-full rounded-[30px] bg-[var(--aparu-surface-soft)] px-6 py-5 text-center">
            <p className="text-sm text-[var(--aparu-muted)]">Сумма поездки</p>
            <p className="mt-1 text-[32px] font-bold text-[var(--aparu-ink)]">
              {Math.round(currentOrder.price_estimate)} ₸
            </p>
          </div>
        )}

        {/* Оценить водителя */}
        {currentOrder?.driver && (
          <div className="aparu-card w-full px-4 py-4">
            <p className="mb-3 text-center text-sm text-[var(--aparu-muted)]">
              Оцените водителя <span className="font-semibold text-[var(--aparu-ink)]">{currentOrder.driver.name}</span>
            </p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n}>
                  <Star size={32} color="#FF6B00" fill={n <= 5 ? "#FF6B00" : "none"} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CTA — установить приложение */}
        <div className="w-full rounded-[30px] bg-gradient-to-br from-[var(--aparu-teal)] via-[#0d8e95] to-[var(--aparu-orange)] p-5 text-white shadow-[0_20px_38px_rgba(0,154,163,0.22)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-white/18">
              <MenuTileIcon size={28} className="h-7 w-7" />
            </div>
            <p className="font-bold text-[16px]">Установите APARU</p>
          </div>
          <p className="text-sm text-white/80 mb-4">
            Заказывайте быстрее, накапливайте бонусы и отслеживайте историю поездок
          </p>
          <div className="flex gap-2">
            <a
              href="https://apps.apple.com"
              target="_blank"
              rel="noreferrer"
              className="flex-1 bg-black/30 rounded-2xl py-2.5 text-sm font-semibold text-white text-center"
            >
              App Store
            </a>
            <a
              href="https://play.google.com"
              target="_blank"
              rel="noreferrer"
              className="flex-1 bg-black/30 rounded-2xl py-2.5 text-sm font-semibold text-white text-center"
            >
              Google Play
            </a>
          </div>
        </div>

        {/* Заказать снова */}
        <Button variant="secondary" size="lg" onClick={handleReorder}>
          Заказать снова
        </Button>
      </div>
    </AppShell>
  );
}
