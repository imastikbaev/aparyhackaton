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
    .replace(/[ә]/g, "а")
    .replace(/[і]/g, "и")
    .replace(/[ң]/g, "н")
    .replace(/[ғ]/g, "г")
    .replace(/[үұ]/g, "у")
    .replace(/[қ]/g, "к")
    .replace(/[ө]/g, "о")
    .replace(/[һ]/g, "х")
    .replace(/\b(улица|ул\.?)\b/g, " ")
    .replace(/\b(көшесі|кошеси|к-сі)\b/g, " ")
    .replace(/\b(проспект|пр\.?)\b/g, " ")
    .replace(/\b(даңғылы|дангылы|даң\.?)\b/g, " ")
    .replace(/\b(переулок|пер\.?)\b/g, " ")
    .replace(/\b(шоссе|тракт|дорога)\b/g, " ")
    .replace(/[,"'`]/g, " ")
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
  const queryHasNumber = /\d/.test(query);

  const entries = await loadIndex();
  const ranked = entries
    .map((entry) => {
      const address = normalize(entry.address);
      const info = normalize(entry.additionalInfo);
      const haystack = `${address} ${info}`;
      const starts = address.startsWith(q);
      const includes = haystack.includes(q);
      if (!starts && !includes) return null;

      const typeWeight =
        entry.type === "h" ? 0 :
        entry.type === "s" ? 250 :
        1200;
      const numberPenalty = queryHasNumber && entry.type !== "h" ? 900 : 0;
      const addressMatchBonus = address.includes(q) ? 0 : 300;
      const infoMatchPenalty = !address.includes(q) && info.includes(q) ? 450 : 0;
      const distancePenalty = distanceScore(lat, lon, entry.latitude, entry.longitude) * 220;

      const score =
        typeWeight +
        (starts ? 0 : 1000) +
        addressMatchBonus +
        infoMatchPenalty +
        numberPenalty +
        address.indexOf(q) * 5 +
        distancePenalty;

      return { entry, score };
    })
    .filter((item): item is { entry: LocalAddressEntry; score: number } => Boolean(item))
    .sort((a, b) => a.score - b.score);

  const primary = ranked.filter(({ entry }) => entry.type !== "o");
  const secondary = ranked.filter(({ entry }) => entry.type === "o");
  const selected = [...primary.slice(0, limit), ...secondary.slice(0, Math.max(0, limit - primary.length))].slice(0, limit);

  return selected.map(({ entry }) => ({
    address: entry.address,
    additionalInfo: entry.additionalInfo,
    latitude: entry.latitude,
    longitude: entry.longitude,
    type: entry.type,
  }));
}
