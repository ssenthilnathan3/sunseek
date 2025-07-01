// app/api/sunsets/recent/route.ts
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const recentSunsets = await prisma.sunset.findMany({
      where: { visibility: "public" },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: { select: { name: true, image: true } },
      },
    });

    return Response.json(recentSunsets);
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch recent sunsets" }),
      { status: 500 },
    );
  }
}
