import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { SITE } from "@/lib/constants";

/** Reverse geocoding (lat/lng → address) via OpenStreetMap Nominatim. Proxied so we can send a proper User-Agent. */
export async function GET(req: Request) {
  if (!rateLimit(req, "geocode", 20)) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
  }
  const { searchParams } = new URL(req.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return NextResponse.json({ error: "Invalid location" }, { status: 400 });
  }
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${lat}&lon=${lng}`,
      { headers: { "User-Agent": `${SITE.name} (${SITE.url})`, "Accept-Language": "en-IN,en" }, cache: "no-store" },
    );
    if (!res.ok) throw new Error();
    const data = await res.json();
    const a = data.address ?? {};
    return NextResponse.json({
      address: data.display_name ?? "",
      area: a.suburb || a.neighbourhood || a.city_district || a.village || a.town || "",
      pincode: /^\d{6}$/.test(a.postcode ?? "") ? a.postcode : "",
    });
  } catch {
    return NextResponse.json({ error: "Couldn't look up this address. Please type it in." }, { status: 502 });
  }
}
