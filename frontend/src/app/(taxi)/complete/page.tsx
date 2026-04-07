"use client";

import { useRouter } from "next/navigation";
import { CheckCircle, Download, Star } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
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
          <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle size={40} color="#22c55e" />
          </div>
          <h1 className="text-[24px] font-bold text-[#1A1A1A]">Поездка завершена!</h1>
          <p className="text-[14px] text-[#757575]">Спасибо, что воспользовались APARU</p>
        </div>

        {/* Итого */}
        {currentOrder?.price_estimate && (
          <div className="w-full bg-[#F5F5F5] rounded-3xl px-6 py-5 text-center">
            <p className="text-sm text-[#757575]">Сумма поездки</p>
            <p className="text-[32px] font-bold text-[#1A1A1A] mt-1">
              {Math.round(currentOrder.price_estimate)} ₸
            </p>
          </div>
        )}

        {/* Оценить водителя */}
        {currentOrder?.driver && (
          <div className="w-full bg-white rounded-3xl border border-[#F0F0F0] px-4 py-4">
            <p className="text-sm text-[#757575] text-center mb-3">
              Оцените водителя <span className="font-semibold text-[#1A1A1A]">{currentOrder.driver.name}</span>
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
        <div className="w-full bg-gradient-to-br from-[#FF6B00] to-[#FF8C2A] rounded-3xl p-5 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Download size={22} color="white" />
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
