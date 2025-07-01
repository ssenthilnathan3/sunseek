// app/api/streak/route.ts
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
    const streak = await prisma.streak.findUnique({
      where: { userId: session.user.id },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const loggedToday = await prisma.sunset.findFirst({
      where: {
        userId: session.user.id,
        createdAt: { gte: today },
      },
    });

    return Response.json({
      currentStreak: streak?.count || 0,
      loggedToday: !!loggedToday,
      lastUpdated: streak?.updatedAt,
    });
  } catch (error) {
    console.error("Failed to check streak status:", error);
    return new Response(
      JSON.stringify({ error: "Failed to check streak status" }),
      {
        status: 500,
      },
    );
  }
}
