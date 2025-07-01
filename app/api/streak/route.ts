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
      select: { count: true, updatedAt: true },
    });

    const response = streak
      ? { count: streak.count, lastUpdated: streak.updatedAt }
      : { count: 0, lastUpdated: null };

    return Response.json(response);
  } catch (error) {
    console.error("Failed to fetch streak:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch streak" }), {
      status: 500,
    });
  }
}
