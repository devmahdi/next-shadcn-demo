import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/db";
import { generateContentFromTrends } from "@/lib/content-generator";

export async function POST(request: NextRequest) {
  // Auth check - allow admin or a special cron token
  const authHeader = request.headers.get("authorization")?.replace("Bearer ", "");
  const cronToken = request.headers.get("x-cron-token");

  // Check if it's a cron job (with special token) or an admin user
  if (cronToken) {
    const expectedToken = process.env.CRON_SECRET || "change-me-in-production";
    if (cronToken !== expectedToken) {
      return NextResponse.json({ error: "Invalid cron token" }, { status: 401 });
    }
  } else if (authHeader) {
    const user = verifyToken(authHeader);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } else {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await generateContentFromTrends();
    
    return NextResponse.json({
      success: result.success,
      message: `Generated ${result.count} content draft(s)`,
      topics: result.topics,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Content generation failed:", msg);
    return NextResponse.json({ error: `Failed: ${msg}` }, { status: 500 });
  }
}
