// app/api/me/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // You can calculate streak and totalSunsets here if needed
  const totalSunsets = await prisma.sunset.count({
    where: { userId: user.id },
  });
  const streak = 7; // Replace with real logic

  return NextResponse.json({
    ...user,
    avatar: user.image,
    joinedAt: user.createdAt,
    totalSunsets,
    streak,
  });
}
