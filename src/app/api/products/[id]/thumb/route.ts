import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = process.env.TURSO_DB_URL;
  const token = process.env.TURSO_AUTH_TOKEN;

  if (!url || !token) {
    return new NextResponse("no db", { status: 500 });
  }

  try {
    const ctl = new AbortController();
    setTimeout(() => ctl.abort(), 8000);
    const res = await fetch(`${url}/v2/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ requests: [{ type: "execute", stmt: { sql: `SELECT images FROM Product WHERE id = '${id}'` } }] }),
      signal: ctl.signal,
    });
    const data = await res.json();
    const rows = data.results?.[0]?.response?.result?.rows;
    if (!rows?.[0]?.[0]?.value) {
      return new NextResponse("no image", { status: 404 });
    }

    const imagesJson = rows[0][0].value as string;
    let firstImage = "";

    try {
      const arr = JSON.parse(imagesJson);
      if (Array.isArray(arr) && arr.length > 0) firstImage = arr[0];
    } catch {
      const m = imagesJson.match(/["']?(data:image\/[^"']+)["']?/);
      if (m) firstImage = m[1];
    }

    if (!firstImage) return new NextResponse("no image", { status: 404 });

    // 如果是 HTTP URL，直接 302
    if (firstImage.startsWith("http")) {
      return NextResponse.redirect(firstImage);
    }

    // SVG 或短 base64 直接返回
    if (firstImage.startsWith("data:image/svg") || firstImage.length < 5000) {
      return new NextResponse(firstImage, {
        headers: { "Content-Type": firstImage.includes("svg") ? "image/svg+xml" : "image/jpeg", "Cache-Control": "public, max-age=3600" },
      });
    }

    return new NextResponse(firstImage, {
      headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=3600" },
    });
  } catch {
    return new NextResponse("error", { status: 500 });
  }
}
