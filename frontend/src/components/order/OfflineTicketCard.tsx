"use client";

import { useEffect, useRef, useState } from "react";
import { CreditCard, Download, ExternalLink, Share2, X } from "lucide-react";
import type { Driver } from "@/types";

interface OfflineTicketCardProps {
  orderId: number;
  driver: Driver;
  pickupAddress: string;
  onClose: () => void;
}

type SaveState = "idle" | "saving" | "saved" | "error";

type ShareNavigator = Navigator & {
  canShare?: (data?: ShareData) => boolean;
};

function drawTicket(
  canvas: HTMLCanvasElement,
  opts: {
    orderId: string;
    plate: string;
    model: string;
    color: string;
    driverName: string;
    pickup: string;
  },
) {
  const width = 390;
  const height = 620;
  canvas.width = width * 2;
  canvas.height = height * 2;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const context = canvas.getContext("2d");
  if (!context) return;
  const ctx = context;

  ctx.setTransform(2, 0, 0, 2, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const orange = "#FC6500";
  const ink = "#2A3037";
  const muted = "#8A95A3";
  const border = "#E8ECF0";
  const soft = "#F5F6FA";
  const radius = 24;

  const now = new Date();
  const timeText = now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  const dateText = now.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  function roundRect(x: number, y: number, w: number, h: number, r: number, fill?: string) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
  }

  roundRect(0, 0, width, height, radius, "white");
  ctx.shadowColor = "rgba(0,0,0,0.12)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 6;
  roundRect(2, 2, width - 4, height - 4, radius, "white");
  ctx.shadowColor = "transparent";

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(width - radius, 0);
  ctx.quadraticCurveTo(width, 0, width, radius);
  ctx.lineTo(width, 140);
  ctx.lineTo(0, 140);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fillStyle = orange;
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = "white";
  ctx.font = "bold 26px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText("APARU", 24, 46);

  ctx.font = "500 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.fillText("Такси по QR", 24, 64);

  roundRect(width - 110, 20, 86, 32, 8, "rgba(255,255,255,0.22)");
  ctx.fillStyle = "white";
  ctx.font = "bold 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText("OFFLINE", width - 96, 40);

  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "500 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText("Номер заказа", 24, 96);
  ctx.fillStyle = "white";
  ctx.font = "bold 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText(opts.orderId, 24, 118);

  ctx.strokeStyle = border;
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 5]);
  ctx.beginPath();
  ctx.moveTo(24, 152);
  ctx.lineTo(width - 24, 152);
  ctx.stroke();
  ctx.setLineDash([]);

  [0, width].forEach((cx) => {
    ctx.beginPath();
    ctx.arc(cx, 152, 14, 0, Math.PI * 2);
    ctx.fillStyle = soft;
    ctx.fill();
  });

  ctx.fillStyle = muted;
  ctx.font = "bold 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText("ВАША МАШИНА", 24, 185);

  roundRect(24, 196, width - 48, 68, 14, `${orange}14`);
  ctx.strokeStyle = orange;
  ctx.lineWidth = 1.5;
  roundRect(24, 196, width - 48, 68, 14);
  ctx.stroke();

  ctx.fillStyle = ink;
  ctx.font = "bold 38px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(opts.plate, width / 2, 242);
  ctx.textAlign = "left";

  ctx.fillStyle = muted;
  ctx.font = "500 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText("Модель", 24, 290);
  ctx.fillText("Цвет", width / 2 + 8, 290);

  ctx.fillStyle = ink;
  ctx.font = "bold 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText(opts.model, 24, 312);
  ctx.fillText(opts.color, width / 2 + 8, 312);

  ctx.strokeStyle = border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(24, 330);
  ctx.lineTo(width - 24, 330);
  ctx.stroke();

  ctx.fillStyle = muted;
  ctx.font = "500 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText("Водитель", 24, 355);
  ctx.fillStyle = ink;
  ctx.font = "bold 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText(opts.driverName, 24, 376);
  ctx.fillStyle = orange;
  ctx.font = "14px Arial";
  ctx.fillText("★★★★★", 24, 396);

  ctx.strokeStyle = border;
  ctx.beginPath();
  ctx.moveTo(24, 412);
  ctx.lineTo(width - 24, 412);
  ctx.stroke();

  ctx.fillStyle = muted;
  ctx.font = "500 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText("Место посадки", 24, 436);

  ctx.fillStyle = ink;
  ctx.font = "bold 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  const maxWidth = width - 48;
  const words = opts.pickup.split(" ");
  let line = "";
  let lineY = 458;

  words.forEach((word) => {
    const testLine = `${line}${word} `;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line.trim(), 24, lineY);
      line = `${word} `;
      lineY += 20;
      return;
    }
    line = testLine;
  });
  ctx.fillText(line.trim(), 24, lineY);

  ctx.fillStyle = muted;
  ctx.font = "500 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText(`${timeText} · ${dateText}`, 24, lineY + 26);

  roundRect(0, height - 54, width, 54, radius, soft);
  ctx.fillStyle = muted;
  ctx.font = "500 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Покажите карточку водителю", width / 2, height - 30);
  ctx.fillStyle = orange;
  ctx.font = "bold 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText("aparu.kz", width / 2, height - 13);
  ctx.textAlign = "left";
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/png");
  });
}

export function OfflineTicketCard({
  orderId,
  driver,
  pickupAddress,
  onClose,
}: OfflineTicketCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [hint, setHint] = useState(
    "Откройте изображение или сохраните его в телефон, чтобы показать карточку без интернета.",
  );

  const ticketId = `ORD-${orderId}`;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    drawTicket(canvas, {
      orderId: ticketId,
      plate: driver.car_number,
      model: driver.car_model,
      color: driver.car_color,
      driverName: driver.name,
      pickup: pickupAddress,
    });

    setImageUrl(canvas.toDataURL("image/png"));
  }, [ticketId, driver, pickupAddress]);

  useEffect(() => {
    if (saveState !== "saved") return;

    const timer = window.setTimeout(() => {
      setSaveState("idle");
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [saveState]);

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setSaveState("saving");
    setHint("Подготавливаем PNG-карточку водителя...");

    const shareNavigator = navigator as ShareNavigator;

    try {
      const blob = await canvasToBlob(canvas);
      if (!blob) {
        throw new Error("blob_unavailable");
      }

      const file = new File([blob], `aparu-${ticketId}.png`, { type: "image/png" });

      if (
        typeof shareNavigator.share === "function" &&
        typeof shareNavigator.canShare === "function" &&
        shareNavigator.canShare({ files: [file] })
      ) {
        await shareNavigator.share({
          files: [file],
          title: "APARU билет",
          text: "Карточка водителя APARU",
        });
        setSaveState("saved");
        setHint("Открылось системное меню: выберите «Сохранить изображение» или «Фото».");
        return;
      }

      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `aparu-${ticketId}.png`;
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);

      setSaveState("saved");
      setHint("Файл загружен. Если браузер не сохранил его в галерею, откройте изображение ниже и сохраните вручную.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setSaveState("idle");
        setHint("Сохранение отменено. Карточка остаётся доступной ниже, её можно открыть и сохранить вручную.");
        return;
      }

      setSaveState("error");
      setHint("Браузер не дал сохранить автоматически. Откройте изображение ниже и сохраните его вручную в галерею.");
    }
  };

  const handleOpenImage = () => {
    if (!imageUrl) return;
    const opened = window.open(imageUrl, "_blank", "noopener,noreferrer");
    if (!opened) {
      setHint("Не удалось открыть новую вкладку. Удерживайте карточку ниже, чтобы сохранить изображение.");
      return;
    }
    setHint("Открыли PNG в новой вкладке. Там можно сохранить его в галерею или файлы телефона.");
  };

  return (
    <div className="fixed inset-0 z-[120] bg-[rgba(15,23,42,0.70)] backdrop-blur-[2px]">
      <div className="flex h-full flex-col bg-[#F4F6F8]">
        <div className="sticky top-0 z-10 border-b border-[#E8ECF0] bg-white/96 px-5 pb-4 pt-[max(env(safe-area-inset-top),16px)] backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[18px] font-extrabold text-[#2A3037]">Оффлайн-карточка</p>
              <p className="mt-0.5 text-xs text-[#8A95A3]">Сохраните и показывайте даже без интернета</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F5F6FA]"
              aria-label="Закрыть"
            >
              <X size={18} color="#8A95A3" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-5 pt-4">
          <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

          <div className="mx-auto w-full max-w-[430px] overflow-hidden rounded-[28px] bg-white shadow-[0_14px_42px_rgba(24,39,75,0.16)]">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={`Оффлайн-карточка водителя для заказа ${ticketId}`}
                className="block w-full"
              />
            ) : (
              <div className="flex aspect-[390/620] items-center justify-center bg-[#F5F6FA] text-sm text-[#8A95A3]">
                Подготавливаем карточку...
              </div>
            )}
          </div>

          <div className="mx-auto mt-3 flex w-full max-w-[430px] items-start gap-2.5 rounded-[18px] bg-white px-4 py-3 shadow-[0_10px_28px_rgba(24,39,75,0.08)]">
            <CreditCard size={16} color="#009AA3" className="mt-0.5 shrink-0" />
            <p className="text-xs leading-relaxed text-[#8A95A3]">{hint}</p>
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-[#E8ECF0] bg-white px-4 pb-[max(env(safe-area-inset-bottom),16px)] pt-3 shadow-[0_-16px_32px_rgba(24,39,75,0.08)]">
          <div className="mx-auto grid w-full max-w-[430px] grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={!imageUrl || saveState === "saving"}
              className="flex w-full items-center justify-center gap-2 rounded-[22px] bg-[#FC6500] py-4 text-[15px] font-bold text-white shadow-[0_12px_28px_rgba(252,101,0,0.30)] active:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saveState === "saving" ? (
                <span className="h-[18px] w-[18px] animate-spin rounded-full border-2 border-white/45 border-t-white" />
              ) : saveState === "saved" ? (
                <Share2 size={18} />
              ) : (
                <Download size={18} />
              )}
              {saveState === "saving"
                ? "Сохраняем..."
                : saveState === "saved"
                  ? "Готово"
                  : "Сохранить в галерею"}
            </button>

            <button
              type="button"
              onClick={handleOpenImage}
              disabled={!imageUrl}
              className="flex w-full items-center justify-center gap-2 rounded-[22px] border border-[#E8ECF0] bg-white py-4 text-[15px] font-semibold text-[#2A3037] shadow-[0_12px_24px_rgba(24,39,75,0.08)] active:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ExternalLink size={18} />
              Открыть PNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
