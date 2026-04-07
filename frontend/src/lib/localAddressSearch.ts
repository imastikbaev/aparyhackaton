import type { GeocodeResult, NearbyPlace, NearbyPlaceCategory } from "@/types";

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

function distanceMeters(latA: number, lonA: number, latB: number, lonB: number): number {
  const earthRadius = 6_371_000;
  const dLat = ((latB - latA) * Math.PI) / 180;
  const dLon = ((lonB - lonA) * Math.PI) / 180;
  const lat1 = (latA * Math.PI) / 180;
  const lat2 = (latB * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function classifyNearbyPlace(entry: LocalAddressEntry): NearbyPlaceCategory | null {
  const haystack = normalize(`${entry.address} ${entry.additionalInfo}`);

  if (/(mall|торгов|торгово-развлекатель|трц|тц|shopping|supermarket)/.test(haystack)) return "mall";
  if (/(pharmacy|апте|pharm|фарма)/.test(haystack)) return "pharmacy";
  if (/(hotel|гостин|отел|hostel)/.test(haystack)) return "hotel";
  if (/(hospital|clinic|поликлиник|больниц|медицин|diagnostic|диагност|медцентр)/.test(haystack)) return "hospital";
  if (/(cafe|coffee|restaurant|рест|кафе|столов|bar|lounge)/.test(haystack)) return "cafe";

  return null;
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

export async function getNearbyPlaceRecommendations(
  lat: number,
  lon: number,
  limit = 6,
): Promise<NearbyPlace[]> {
  const entries = await loadIndex();
  const seen = new Set<string>();

  const ranked = entries
    .filter((entry) => entry.type === "o")
    .map((entry) => {
      const category = classifyNearbyPlace(entry);
      if (!category) return null;

      const key = normalize(`${entry.address}|${entry.additionalInfo}|${category}`);
      if (seen.has(key)) return null;
      seen.add(key);

      return {
        address: entry.address,
        additionalInfo: entry.additionalInfo,
        latitude: entry.latitude,
        longitude: entry.longitude,
        type: entry.type,
        category,
        distanceMeters: distanceMeters(lat, lon, entry.latitude, entry.longitude),
      } satisfies NearbyPlace;
    })
    .filter((entry): entry is NearbyPlace => Boolean(entry))
    .sort((a, b) => a.distanceMeters - b.distanceMeters);

  const picked = new Set<NearbyPlaceCategory>();
  const primary: NearbyPlace[] = [];
  const secondary: NearbyPlace[] = [];

  for (const item of ranked) {
    if (!picked.has(item.category)) {
      primary.push(item);
      picked.add(item.category);
      continue;
    }
    secondary.push(item);
  }

  return [...primary, ...secondary].slice(0, limit);
}
