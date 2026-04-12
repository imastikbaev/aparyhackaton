"use client";

import { useEffect, useRef, useState } from "react";
import { CreditCard, Download, X } from "lucide-react";
import type { Driver } from "@/types";

interface OfflineTicketCardProps {
  orderId: number;
  driver: Driver;
  pickupAddress: string;
  onClose: () => void;
}

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
  const W = 390, H = 620;
  canvas.width  = W * 2;
  canvas.height = H * 2;
  canvas.style.width  = W + "px";
  canvas.style.height = H + "px";

  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(2, 2);

  const org  = "#FC6500";
  const dk   = "#2A3037";
  const gray = "#8A95A3";
  const bdr  = "#E8ECF0";
  const bg   = "#F5F6FA";
  const R    = 24;

  const now     = new Date();
  const timeStr = now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });

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
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  }

  // Card background
  roundRect(0, 0, W, H, R, "white");
  ctx.shadowColor = "rgba(0,0,0,.12)";
  ctx.shadowBlur  = 24;
  ctx.shadowOffsetY = 6;
  roundRect(2, 2, W - 4, H - 4, R, "white");
  ctx.shadowColor = "transparent";

  // Orange header
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(R, 0); ctx.lineTo(W - R, 0);
  ctx.quadraticCurveTo(W, 0, W, R);
  ctx.lineTo(W, 140); ctx.lineTo(0, 140); ctx.lineTo(0, R);
  ctx.quadraticCurveTo(0, 0, R, 0);
  ctx.closePath();
  ctx.fillStyle = org; ctx.fill();
  ctx.restore();

  // APARU brand
  ctx.fillStyle = "white";
  ctx.font = "bold 26px -apple-system, sans-serif";
  ctx.fillText("APARU", 24, 46);

  ctx.font = "500 12px -apple-system, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,.75)";
  ctx.fillText("Такси по QR", 24, 64);

  // OFFLINE badge
  roundRect(W - 110, 20, 86, 32, 8, "rgba(255,255,255,.22)");
  ctx.fillStyle = "white";
  ctx.font = "bold 11px -apple-system, sans-serif";
  ctx.fillText("OFFLINE", W - 96, 40);

  // Order ID
  ctx.fillStyle = "rgba(255,255,255,.9)";
  ctx.font = "500 12px -apple-system, sans-serif";
  ctx.fillText("Номер заказа", 24, 96);
  ctx.fillStyle = "white";
  ctx.font = "bold 18px -apple-system, sans-serif";
  ctx.fillText(opts.orderId, 24, 118);

  // Tear line
  ctx.strokeStyle = bdr;
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 5]);
  ctx.beginPath(); ctx.moveTo(24, 152); ctx.lineTo(W - 24, 152); ctx.stroke();
  ctx.setLineDash([]);

  [0, W].forEach(cx => {
    ctx.beginPath();
    ctx.arc(cx, 152, 14, 0, Math.PI * 2);
    ctx.fillStyle = bg; ctx.fill();
  });

  // ВАША МАШИНА
  ctx.fillStyle = gray;
  ctx.font = "bold 11px -apple-system, sans-serif";
  ctx.fillText("ВАША МАШИНА", 24, 185);

  // Plate block
  roundRect(24, 196, W - 48, 68, 14, org + "14");
  ctx.strokeStyle = org;
  ctx.lineWidth = 1.5;
  roundRect(24, 196, W - 48, 68, 14);
  ctx.stroke();

  ctx.fillStyle = dk;
  ctx.font = "bold 38px -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(opts.plate, W / 2, 242);
  ctx.textAlign = "left";

  // Model + color
  ctx.fillStyle = gray;
  ctx.font = "500 13px -apple-system, sans-serif";
  ctx.fillText("Модель", 24, 290);
  ctx.fillText("Цвет", W / 2 + 8, 290);

  ctx.fillStyle = dk;
  ctx.font = "bold 16px -apple-system, sans-serif";
  ctx.fillText(opts.model, 24, 312);
  ctx.fillText(opts.color, W / 2 + 8, 312);

  // Divider
  ctx.strokeStyle = bdr; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(24, 330); ctx.lineTo(W - 24, 330); ctx.stroke();

  // Driver
  ctx.fillStyle = gray;
  ctx.font = "500 12px -apple-system, sans-serif";
  ctx.fillText("Водитель", 24, 355);
  ctx.fillStyle = dk;
  ctx.font = "bold 16px -apple-system, sans-serif";
  ctx.fillText(opts.driverName, 24, 376);
  ctx.fillStyle = org;
  ctx.font = "14px Arial";
  ctx.fillText("★★★★★", 24, 396);

  // Divider
  ctx.strokeStyle = bdr;
  ctx.beginPath(); ctx.moveTo(24, 412); ctx.lineTo(W - 24, 412); ctx.stroke();

  // Pickup
  ctx.fillStyle = gray;
  ctx.font = "500 12px -apple-system, sans-serif";
  ctx.fillText("Место посадки", 24, 436);

  ctx.fillStyle = dk;
  ctx.font = "bold 14px -apple-system, sans-serif";
  const maxW = W - 48;
  const words = opts.pickup.split(" ");
  let line = "", y = 458;
  words.forEach(word => {
    const test = line + word + " ";
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line.trim(), 24, y); line = word + " "; y += 20;
    } else { line = test; }
  });
  ctx.fillText(line.trim(), 24, y);

  // Time
  ctx.fillStyle = gray;
  ctx.font = "500 12px -apple-system, sans-serif";
  ctx.fillText(`${timeStr} · ${dateStr}`, 24, y + 26);

  // Footer
  roundRect(0, H - 54, W, 54, R, bg);
  ctx.fillStyle = gray;
  ctx.font = "500 12px -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Покажите карточку водителю", W / 2, H - 30);
  ctx.fillStyle = org;
  ctx.font = "bold 11px -apple-system, sans-serif";
  ctx.fillText("aparu.kz", W / 2, H - 13);
  ctx.textAlign = "left";
}

export function OfflineTicketCard({ orderId, driver, pickupAddress, onClose }: OfflineTicketCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [saved, setSaved] = useState(false);

  const ticketId = `ORD-${orderId}`;

  useEffect(() => {
    if (canvasRef.current) {
      drawTicket(canvasRef.current, {
        orderId:    ticketId,
        plate:      driver.car_number,
        model:      driver.car_model,
        color:      driver.car_color,
        driverName: driver.name,
        pickup:     pickupAddress,
      });
    }
  }, [ticketId, driver, pickupAddress]);

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Mobile: Web Share API with file (saves to gallery)
    if (typeof navigator.share === "function" && typeof navigator.canShare === "function") {
      try {
        const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, "image/png"));
        if (blob) {
          const file = new File([blob], `aparu-${ticketId}.png`, { type: "image/png" });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: "APARU билет", text: "Мой заказ такси" });
            setSaved(true);
            return;
          }
        }
      } catch {
        // fallthrough to download
      }
    }

    // Desktop / fallback: download link
    const link = document.createElement("a");
    link.download = `aparu-${ticketId}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    setSaved(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/55" onClick={onClose} />

      {/* Sheet */}
      <div className="relative z-10 flex max-h-[92dvh] flex-col rounded-t-[24px] bg-white">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-[#d6dee2]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-4 pt-1">
          <div>
            <p className="text-[18px] font-extrabold text-[#2A3037]">Оффлайн-карточка</p>
            <p className="mt-0.5 text-xs text-[#8A95A3]">Сохраните — работает без интернета</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F5F6FA]"
          >
            <X size={18} color="#8A95A3" />
          </button>
        </div>

        {/* Canvas preview */}
        <div className="flex-1 overflow-y-auto px-5 pb-6">
          <div className="overflow-hidden rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
            <canvas ref={canvasRef} style={{ display: "block", width: "100%" }} />
          </div>

          {/* Tip */}
          <div className="mt-3 flex items-start gap-2.5 rounded-[14px] bg-[#F5F6FA] px-4 py-3">
            <CreditCard size={16} color="#009AA3" className="mt-0.5 shrink-0" />
            <p className="text-xs leading-relaxed text-[#8A95A3]">
              Если пропадёт интернет — покажите водителю номер авто и госномер с этой карточки
            </p>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-[22px] bg-[#FC6500] py-4 text-[15px] font-bold text-white shadow-[0_12px_28px_rgba(252,101,0,0.30)] active:opacity-90"
          >
            <Download size={18} />
            {saved ? "Сохранено!" : "Сохранить в галерею"}
          </button>
        </div>
      </div>
    </div>
  );
}
