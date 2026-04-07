import type { GeocodeResult } from "@/types";

interface LocalAddressEntry {
  address: string;
  additionalInfo: string;
  latitude: number;
  longitude: number;
  type: GeocodeResult["type"];
}

let addressIndexPromise: Promise<LocalAddressEntry[]> | null = null;

function loadIndex(): Promise<LocalAddressEntry[]> {
  if (!addressIndexPromise) {
    addressIndexPromise = fetch("/data/oskemen-addresses.json")
      .then((res) => {
        if (!res.ok) throw new Error("Не удалось загрузить локальный адресный индекс");
        return res.json() as Promise<LocalAddressEntry[]>;
      })
      .catch(() => []);
  }
  return addressIndexPromise;
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/\s+/g, " ")
    .trim();
}

function distanceScore(latA: number, lonA: number, latB: number, lonB: number): number {
  return Math.hypot(latA - latB, lonA - lonB);
}

export async function searchLocalAddresses(
  query: string,
  lat: number,
  lon: number,
  limit = 5,
): Promise<GeocodeResult[]> {
  const q = normalize(query);
  if (!q) return [];

  const entries = await loadIndex();
  const ranked = entries
    .map((entry) => {
      const address = normalize(entry.address);
      const info = normalize(entry.additionalInfo);
      const haystack = `${address} ${info}`;
      const starts = address.startsWith(q);
      const includes = haystack.includes(q);
      if (!starts && !includes) return null;

      const score =
        (starts ? 0 : 1000) +
        address.indexOf(q) * 5 +
        distanceScore(lat, lon, entry.latitude, entry.longitude) * 100;

      return { entry, score };
    })
    .filter((item): item is { entry: LocalAddressEntry; score: number } => Boolean(item))
    .sort((a, b) => a.score - b.score)
    .slice(0, limit);

  return ranked.map(({ entry }) => ({
    address: entry.address,
    additionalInfo: entry.additionalInfo,
    latitude: entry.latitude,
    longitude: entry.longitude,
    type: entry.type,
  }));
}
