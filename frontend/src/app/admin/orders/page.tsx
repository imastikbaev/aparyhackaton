"use client";

import { FormEvent, useState } from "react";
import { getAdminOrders } from "@/lib/api";
import type { AdminOrder } from "@/types";

function formatDate(value: string) {
  return new Date(value).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminOrdersPage() {
  const [key, setKey] = useState("");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const nextOrders = await getAdminOrders(key.trim());
      setOrders(nextOrders);
    } catch (err) {
      setOrders([]);
      setError(err instanceof Error ? err.message : "Не удалось загрузить заказы");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F4F6F8] px-4 py-6 text-[var(--aparu-ink)]">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 rounded-[28px] bg-white p-5 shadow-[0_18px_45px_rgba(24,39,75,0.08)]">
          <p className="text-[24px] font-extrabold">Заказы из БД</p>
          <p className="mt-1 text-sm text-[var(--aparu-muted)]">
            Быстрый read-only просмотр последних заказов без прямого входа в PostgreSQL.
          </p>

          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              type="password"
              value={key}
              onChange={(event) => setKey(event.target.value)}
              placeholder="Ключ доступа"
              className="h-12 flex-1 rounded-[18px] border border-[var(--aparu-line)] bg-white px-4 text-[15px] outline-none focus:border-[var(--aparu-orange)]"
            />
            <button
              type="submit"
              disabled={loading || !key.trim()}
              className="h-12 rounded-[18px] bg-[var(--aparu-orange)] px-5 text-sm font-semibold text-white shadow-[0_16px_28px_rgba(255,107,0,0.24)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Загружаем..." : "Открыть заказы"}
            </button>
          </form>

          <p className="mt-3 text-xs text-[var(--aparu-muted)]">
            Ключ по умолчанию: <span className="font-semibold text-[var(--aparu-ink)]">aparu-admin</span>.
            Для production лучше заменить через `ADMIN_DASHBOARD_KEY`.
          </p>

          {error ? (
            <div className="mt-4 rounded-[18px] bg-[#FFF1F1] px-4 py-3 text-sm text-[#C0392B]">
              {error}
            </div>
          ) : null}
        </div>

        <div className="overflow-hidden rounded-[28px] bg-white shadow-[0_18px_45px_rgba(24,39,75,0.08)]">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-[#F8FAFB] text-left text-xs uppercase tracking-[0.08em] text-[var(--aparu-muted)]">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Статус</th>
                  <th className="px-4 py-3">Телефон</th>
                  <th className="px-4 py-3">Точка</th>
                  <th className="px-4 py-3">Маршрут</th>
                  <th className="px-4 py-3">Водитель</th>
                  <th className="px-4 py-3">Сумма</th>
                  <th className="px-4 py-3">Создан</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-sm text-[var(--aparu-muted)]">
                      Пока ничего не загружено. Введите ключ и откройте список заказов.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="border-t border-[var(--aparu-line)] align-top text-sm">
                      <td className="px-4 py-3 font-semibold">{order.id}</td>
                      <td className="px-4 py-3">{order.status}</td>
                      <td className="px-4 py-3">{order.user_phone}</td>
                      <td className="px-4 py-3">{order.qr_point_name}</td>
                      <td className="px-4 py-3">
                        <div>{order.pickup_address}</div>
                        <div className="mt-1 text-[var(--aparu-muted)]">
                          {order.destination_address ?? "Без конечной точки"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {order.driver_name ? `${order.driver_name} · ${order.car_number}` : "Не назначен"}
                      </td>
                      <td className="px-4 py-3">
                        {order.price_estimate != null ? `${order.price_estimate} тг` : "—"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{formatDate(order.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
