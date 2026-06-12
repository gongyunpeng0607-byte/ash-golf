import { NextRequest, NextResponse } from "next/server";

const MAX_SIZE = 3 * 1024 * 1024; // 3MB each

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return NextResponse.json({ success: false, error: "沒有檔案" }, { status: 400 });
    }

    const urls: string[] = [];

    for (const file of files) {
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ success: false, error: `檔案 ${file.name} 超過 3MB 限制` }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const mime = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif" }[ext] || "image/jpeg";
      const dataUrl = `data:${mime};base64,${buffer.toString("base64")}`;
      urls.push(dataUrl);
    }

    // 存在 Turso 远程表中（图片库）
    const tursoUrl = process.env.TURSO_DB_URL;
    const tursoToken = process.env.TURSO_AUTH_TOKEN;
    if (tursoUrl && tursoToken) {
      try {
        await fetch(`${tursoUrl}/v2/pipeline`, {
          method: "POST",
          headers: { Authorization: `Bearer ${tursoToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ requests: [{ type: "execute", stmt: { sql: "CREATE TABLE IF NOT EXISTS UploadedImage(id TEXT PRIMARY KEY, dataUrl TEXT NOT NULL, createdAt TEXT DEFAULT (datetime('now')))" } }] }),
        });

        for (const url of urls) {
          const id = crypto.randomUUID();
          await fetch(`${tursoUrl}/v2/pipeline`, {
            method: "POST",
            headers: { Authorization: `Bearer ${tursoToken}`, "Content-Type": "application/json" },
            body: JSON.stringify({ requests: [{ type: "execute", stmt: { sql: `INSERT INTO UploadedImage(id,dataUrl) VALUES('${id}','${url.replace(/'/g,"''")}')` } }] }),
          });
        }
      } catch { /* 云端存储失败不阻塞返回 */ }
    }

    return NextResponse.json({ success: true, urls });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
