import { NextRequest, NextResponse } from "next/server";

import { normalizeRouteResponse, proxyAparuMaps, type RawRouteResponse } from "../_shared";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const raw = await proxyAparuMaps<RawRouteResponse>("/api/v1/maps/route", body);
    return NextResponse.json(normalizeRouteResponse(raw));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Route request failed";
    return NextResponse.json({ detail: message }, { status: 502 });
  }
}
