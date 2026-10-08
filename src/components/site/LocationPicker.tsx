"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Loader2, LocateFixed } from "lucide-react";

export type PickedLocation = { lat: number; lng: number; address: string; area: string; pincode: string };

const BANGALORE: [number, number] = [12.9716, 77.5946];

/**
 * Map with a draggable pin. "Use my current location" jumps to the device's GPS position;
 * every pin move reverse-geocodes and hands the address back so the form can prefill (and let them edit) it.
 */
export function LocationPicker({ onPick }: { onPick: (p: PickedLocation) => void }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const pin = useRef<Marker | null>(null);
  const pickRef = useRef(onPick);
  useEffect(() => {
    pickRef.current = onPick;
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function lookup(lat: number, lng: number) {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      pickRef.current({ lat, lng, address: data.address, area: data.area, pincode: data.pincode });
    } catch (e) {
      pickRef.current({ lat, lng, address: "", area: "", pincode: "" });
      setMsg(e instanceof Error && e.message ? e.message : "Couldn't find the address — please type it below.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !el.current || map.current) return;
      const m = L.map(el.current, { center: BANGALORE, zoom: 11, attributionControl: true });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
      }).addTo(m);
      const icon = L.divIcon({
        className: "",
        html: '<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;background:#0f9d8a;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);transform:rotate(-45deg)"></div>',
        iconSize: [22, 22],
        iconAnchor: [11, 22],
      });
      const mk = L.marker(BANGALORE, { draggable: true, icon }).addTo(m);
      mk.on("dragend", () => {
        const { lat, lng } = mk.getLatLng();
        lookup(lat, lng);
      });
      m.on("click", (e) => {
        mk.setLatLng(e.latlng);
        lookup(e.latlng.lat, e.latlng.lng);
      });
      map.current = m;
      pin.current = mk;
      // The dialog may still be animating in; recompute size once it settles.
      setTimeout(() => m.invalidateSize(), 250);
    })();
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
    };
  }, []);

  function locate() {
    if (!navigator.geolocation) return setMsg("Your browser can't share location — drop the pin on the map instead.");
    setBusy(true);
    setMsg("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const ll: [number, number] = [coords.latitude, coords.longitude];
        map.current?.setView(ll, 16);
        pin.current?.setLatLng(ll);
        lookup(...ll);
      },
      () => {
        setBusy(false);
        setMsg("Location permission was denied — tap the map to drop the pin instead.");
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={locate}
        disabled={busy}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-teal bg-teal-soft/50 px-4 py-2.5 text-sm font-semibold text-teal-deep transition hover:bg-teal-soft disabled:opacity-60"
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <LocateFixed className="size-4" />}
        Use my current location
      </button>
      <div ref={el} className="relative z-0 h-52 overflow-hidden rounded-xl border border-line" />
      <p className="text-xs text-muted">{msg || "Or tap the map / drag the pin to your location."}</p>
    </div>
  );
}
