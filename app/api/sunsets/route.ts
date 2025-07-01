// app/api/sunsets/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 10);
    const skip = (page - 1) * limit;

    const sunsets = await prisma.sunset.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        likes: {
          select: { user: { select: { id: true, name: true, email: true } } },
        },
        comments: {
          orderBy: { createdAt: "desc" },
          take: 3,
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    const total = await prisma.sunset.count({
      where: { userId: session.user.id },
    });

    return Response.json({
      sunsets,
      pagination: {
        total,
        page,
        limit,
        hasMore: skip + limit < total,
      },
    });
  } catch (error) {
    console.error("Failed to fetch sunsets:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch sunsets" }), {
      status: 500,
    });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const { imageUrl, caption, location, visibility } = await req.json();

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: "Image URL is required" }), {
        status: 400,
      });
    }

    const sunset = await prisma.sunset.create({
      data: {
        userId: session.user.id,
        imageUrl,
        caption,
        location,
        visibility,
      },
    });

    // Update streak
    await prisma.streak.upsert({
      where: { userId: session.user.id },
      update: { count: { increment: 1 } },
      create: { userId: session.user.id, count: 1 },
    });

    return new Response(JSON.stringify({ sunset }), { status: 201 });
  } catch (error) {
    console.error("Failed to create sunset:", error);
    return new Response(JSON.stringify({ error: "Failed to create sunset" }), {
      status: 500,
    });
  }
}
