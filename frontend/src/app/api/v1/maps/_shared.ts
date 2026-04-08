const APARU_MAPS_URL = process.env.APARU_MAPS_URL ?? "https://testtaxi3.aparu.kz";
const APARU_MAPS_API_KEY = process.env.APARU_MAPS_API_KEY ?? "test1";

interface RawGeocodeResult {
  Address: string;
  AdditionalInfo: string;
  Latitude: number;
  Longitude: number;
  Type: "s" | "h" | "o" | "c";
}

export interface RawGeocodeResponse {
  Results?: RawGeocodeResult[];
  results?: Array<{
    address: string;
    additionalInfo: string;
    latitude: number;
    longitude: number;
    type: "s" | "h" | "o" | "c";
  }>;
}

export interface RawReverseGeocodeResponse {
  PlaceName?: string;
  AreaName?: string;
  AccuratePlace?: boolean;
  Locality?: {
    LocalityId: number;
    Name: string;
    Latitude: number;
    Longitude: number;
  };
  placeName?: string;
  areaName?: string;
  accuratePlace?: boolean;
  locality?: {
    localityId: number;
    name: string;
    latitude: number;
    longitude: number;
  };
}

interface RawRouteInstruction {
  Distance: number;
  Time: number;
  Text: string;
  StreetName: string;
  Sign: number;
  Interval: [number, number];
}

export interface RawRouteResponse {
  Distance: number;
  Time: number;
  Coordinates: [number, number][];
  BBox: [number, number, number, number];
  Instructions?: RawRouteInstruction[];
}

export async function proxyAparuMaps<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${APARU_MAPS_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": APARU_MAPS_API_KEY,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      (data && typeof data.message === "string" && data.message) ||
      (data && typeof data.detail === "string" && data.detail) ||
      "Maps API request failed";
    throw new Error(message);
  }

  return data as T;
}

export function normalizeGeocodeResponse(raw: RawGeocodeResponse) {
  const results = raw.Results ?? raw.results ?? [];
  return {
    results: results.map((item) => ({
      address: "Address" in item ? item.Address : item.address,
      additionalInfo: "AdditionalInfo" in item ? item.AdditionalInfo : item.additionalInfo,
      latitude: "Latitude" in item ? item.Latitude : item.latitude,
      longitude: "Longitude" in item ? item.Longitude : item.longitude,
      type: "Type" in item ? item.Type : item.type,
    })),
  };
}

export function normalizeReverseGeocodeResponse(raw: RawReverseGeocodeResponse) {
  const locality = raw.Locality ?? raw.locality;

  return {
    placeName: raw.PlaceName ?? raw.placeName ?? "",
    areaName: raw.AreaName ?? raw.areaName ?? "",
    accuratePlace: raw.AccuratePlace ?? raw.accuratePlace ?? false,
    locality: locality
      ? {
          localityId: "LocalityId" in locality ? locality.LocalityId : locality.localityId,
          name: "Name" in locality ? locality.Name : locality.name,
          latitude: "Latitude" in locality ? locality.Latitude : locality.latitude,
          longitude: "Longitude" in locality ? locality.Longitude : locality.longitude,
        }
      : null,
  };
}

export function normalizeRouteResponse(raw: RawRouteResponse) {
  return {
    distance: raw.Distance,
    time: raw.Time,
    coordinates: raw.Coordinates,
    bbox: raw.BBox,
    instructions: (raw.Instructions ?? []).map((instruction) => ({
      distance: instruction.Distance,
      time: instruction.Time,
      text: instruction.Text,
      streetName: instruction.StreetName,
      sign: instruction.Sign,
      interval: instruction.Interval,
    })),
  };
}
