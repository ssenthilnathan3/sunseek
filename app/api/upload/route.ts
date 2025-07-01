// app/api/upload/route.ts
import { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { put } from "@vercel/blob";
import formidable from "formidable";
import { Readable } from "stream";
import { NextApiRequest } from "next";
import type { IncomingMessage } from "http";
import fs from "fs/promises";

// Disable Next.js body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  // Authenticate
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const formData = await parseFormData(req);
    console.log(formData.file);
    const file = formData.file?.[0];

    if (!file?.filepath) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
      });
    }

    const buffer = await fs.readFile(file.filepath);

    const blob = await put(
      `sunset-${Date.now()}-${file.originalFilename}`,
      buffer,
      {
        access: "public",
        contentType: file.mimetype || "application/octet-stream",
      },
    );

    return Response.json({ url: blob.url });
  } catch (err) {
    console.error("Upload error:", err);
    return new Response(JSON.stringify({ error: "Upload failed" }), {
      status: 500,
    });
  }
}

// This wraps the NextRequest into an IncomingMessage for formidable
async function parseFormData(req: NextRequest): Promise<{ file: any }> {
  const contentType = req.headers.get("content-type");
  const contentLength = req.headers.get("content-length");

  if (!contentType || !contentLength) {
    throw new Error("Missing required headers");
  }

  // Convert Web ReadableStream to Node readable stream
  const readable = Readable.fromWeb(req.body as any);

  const reqShim = Object.assign(readable, {
    headers: {
      "content-type": contentType,
      "content-length": contentLength,
    },
  }) as IncomingMessage;

  const form = formidable({ keepExtensions: true, multiples: false });

  return new Promise((resolve, reject) => {
    form.parse(reqShim, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ ...fields, ...files });
    });
  });
}
