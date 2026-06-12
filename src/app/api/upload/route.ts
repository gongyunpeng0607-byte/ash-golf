import { NextRequest, NextResponse } from "next/server";

// 现在图片压缩在客户端做（canvas → base64），这个 API 保留给以后用
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    if (files.length === 0) {
      return NextResponse.json({ success: false, error: "沒有檔案" }, { status: 400 });
    }
    // 直接返回文件名提示（压缩已在客户端完成）
    return NextResponse.json({ success: true, urls: [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
