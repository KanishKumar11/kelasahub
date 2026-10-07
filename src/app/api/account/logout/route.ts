import { NextResponse } from "next/server";
import { signOutCandidate } from "@/lib/candidate-auth";

export async function POST() {
  await signOutCandidate();
  return NextResponse.json({ ok: true });
}
