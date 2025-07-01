// app/api/sunsets/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    // Check if user already logged a sunset today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingSunset = await prisma.sunset.findFirst({
      where: {
        userId: session.user.id,
        createdAt: { gte: today },
      },
    });

    if (existingSunset) {
      return new Response(
        JSON.stringify({ error: "Already logged a sunset today" }),
        { status: 400 },
      );
    }

    // Update or create streak
    const streak = await prisma.streak.upsert({
      where: { userId: session.user.id },
      update: {
        count: { increment: 1 },
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        count: 1,
      },
    });

    return Response.json({
      success: true,
      count: streak.count,
    });
  } catch (error) {
    console.error("Failed to increment streak:", error);
    return new Response(
      JSON.stringify({ error: "Failed to increment streak" }),
      {
        status: 500,
      },
    );
  }
}
