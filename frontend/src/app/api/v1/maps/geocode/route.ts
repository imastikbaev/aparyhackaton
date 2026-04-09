import { NextRequest, NextResponse } from "next/server";

import { normalizeGeocodeResponse, proxyAparuMaps, type RawGeocodeResponse } from "../_shared";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await proxyAparuMaps<RawGeocodeResponse>("/api/v1/maps/geocode", body);
    return NextResponse.json(normalizeGeocodeResponse(data));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Geocode request failed";
    return NextResponse.json({ detail: message }, { status: 502 });
  }
}
