import { NextRequest, NextResponse } from "next/server";

import { appwriteConfig } from "@/lib/appwrite/config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Lightweight ping to Appwrite that doubles as a keep-warm hook for the
 * Vercel cron. Hitting this once a day prevents Appwrite Cloud's free
 * tier from auto-pausing the project.
 *
 * Auth: requires `Authorization: Bearer ${CRON_SECRET}` header.
 * Vercel Cron sets this automatically when CRON_SECRET is configured.
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const expected = process.env.CRON_SECRET
    ? `Bearer ${process.env.CRON_SECRET}`
    : null;

  if (expected && auth !== expected) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const start = Date.now();
  try {
    const res = await fetch(`${appwriteConfig.endpointUrl}/health`, {
      headers: {
        "X-Appwrite-Project": appwriteConfig.projectId,
        "X-Appwrite-Key": appwriteConfig.secretKey,
      },
      cache: "no-store",
    });
    const ok = res.ok;
    return NextResponse.json(
      {
        ok,
        appwriteStatus: res.status,
        durationMs: Date.now() - start,
        timestamp: new Date().toISOString(),
      },
      { status: ok ? 200 : 503 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "unknown",
        durationMs: Date.now() - start,
      },
      { status: 503 },
    );
  }
}
