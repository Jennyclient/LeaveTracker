import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { NextResponse } from "next/server";

const MAX_ATTACHMENT_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set([".pdf", ".jpg", ".jpeg", ".png", ".webp"]);

function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "No attachment file provided." },
        { status: 400 }
      );
    }

    if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, message: "Attachment must be 5 MB or smaller." },
        { status: 400 }
      );
    }

    const extension = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return NextResponse.json(
        {
          success: false,
          message: "Only PDF, JPG, PNG, or WEBP files are allowed.",
        },
        { status: 400 }
      );
    }

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "leave-attachments"
    );
    await mkdir(uploadDir, { recursive: true });

    const safeName = sanitizeFileName(file.name.replace(extension, ""));
    const storedFileName = `${Date.now()}-${safeName}${extension}`;
    const storedFilePath = path.join(uploadDir, storedFileName);
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    await writeFile(storedFilePath, fileBuffer);

    const origin = new URL(request.url).origin;
    const url = `${origin}/uploads/leave-attachments/${storedFileName}`;

    return NextResponse.json({
      success: true,
      message: "Attachment uploaded successfully.",
      url,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to upload attachment." },
      { status: 500 }
    );
  }
}
