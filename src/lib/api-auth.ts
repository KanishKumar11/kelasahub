import "server-only";
import { NextResponse } from "next/server";
import { getSession } from "./auth";

/** Returns a 401 response when signed out, otherwise null. */
export async function guard() {
  const s = await getSession();
  return s ? null : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
