const TARIFFS = {
  economy: { base: 300, perKm: 100, minimum: 500 },
  standard: { base: 350, perKm: 120, minimum: 600 },
  comfort: { base: 500, perKm: 150, minimum: 800 },
} as const;

export function estimatePrice(distanceMeters: number, tariff = "standard"): number {
  const config = TARIFFS[tariff as keyof typeof TARIFFS] ?? TARIFFS.standard;
  const kilometers = Math.max(distanceMeters, 0) / 1000;
  const rawPrice = config.base + kilometers * config.perKm;
  return Math.round(Math.max(rawPrice, config.minimum));
}

export function estimateDistanceMeters(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
): number {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadius = 6_371_000;

  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);
  const deltaLat = toRadians(to.latitude - from.latitude);
  const deltaLon = toRadians(to.longitude - from.longitude);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
}
