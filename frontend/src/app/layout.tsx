import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "APARU — Быстрый заказ такси",
  description: "Закажи такси за один клик по QR-коду",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#FF6B35",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" style={{ minHeight: "100%" }}>
      <body
        style={{
          minHeight: "100%",
          overflowX: "hidden",
          fontFamily:
            '"Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif',
        }}
      >
        {children}
      </body>
    </html>
  );
}
