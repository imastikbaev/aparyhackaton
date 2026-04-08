import { NextRequest, NextResponse } from "next/server";

import { normalizeReverseGeocodeResponse, proxyAparuMaps, type RawReverseGeocodeResponse } from "../_shared";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await proxyAparuMaps<RawReverseGeocodeResponse>("/api/v1/maps/reverse-geocode", body);
    return NextResponse.json(normalizeReverseGeocodeResponse(data));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Reverse geocode request failed";
    return NextResponse.json({ detail: message }, { status: 502 });
  }
}
