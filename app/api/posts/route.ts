import { NextRequest, NextResponse } from "next/server";
import { getPublishedPosts, getAllPosts, createPost, verifyToken, seedAdmin } from "@/lib/db";

// Seed admin on first API call
seedAdmin();

export async function GET(request: NextRequest) {
  const admin = request.headers.get("x-admin") === "true";
  const token = request.headers.get("authorization")?.replace("Bearer ", "");

  if (admin && token) {
    const user = verifyToken(token);
    if (user && user.role === "admin") {
      return NextResponse.json(getAllPosts());
    }
  }

  return NextResponse.json(getPublishedPosts());
}

export async function POST(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = verifyToken(token);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, slug, excerpt, content, published, cover_image } = await request.json();
  if (!title || !slug) {
    return NextResponse.json({ error: "Title and slug are required" }, { status: 400 });
  }

  try {
    const post = createPost(title, slug, excerpt || "", content || "", user.userId, published ? 1 : 0, cover_image);
    return NextResponse.json(post, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg.includes("UNIQUE")) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
