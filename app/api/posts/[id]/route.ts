import { NextRequest, NextResponse } from "next/server";
import { getPostById, updatePost, deletePost, verifyToken } from "@/lib/db";

function getAdmin(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  const user = verifyToken(token);
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = getPostById(Number(id));
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!getAdmin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const data = await request.json();
  const post = updatePost(Number(id), data);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!getAdmin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const ok = deletePost(Number(id));
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
