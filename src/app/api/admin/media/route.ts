import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Media } from "@/lib/models";
import { guard } from "@/lib/api-auth";

const TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const file = (await req.formData()).get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (!TYPES.includes(file.type)) return NextResponse.json({ error: "Use a JPG, PNG or WebP image" }, { status: 400 });
  if (file.size > 3 * 1024 * 1024) return NextResponse.json({ error: "Image must be under 3 MB" }, { status: 400 });
  await connectDB();
  const m = await Media.create({
    filename: file.name,
    contentType: file.type,
    size: file.size,
    data: Buffer.from(await file.arrayBuffer()),
  });
  return NextResponse.json({ url: `/api/media/${m._id}` });
}
