import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// GET /api/sunsets/:id
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const sunset = await prisma.sunset.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
        likes: {
          select: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!sunset) {
      return new Response(JSON.stringify({ error: "Sunset not found" }), {
        status: 404,
      });
    }

    return Response.json({ sunset });
  } catch (error) {
    console.error("Failed to fetch sunset:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch sunset" }), {
      status: 500,
    });
  }
}

// DELETE /api/sunsets/:id
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const sunset = await prisma.sunset.findUnique({
      where: { id: params.id },
    });

    if (!sunset) {
      return new Response(JSON.stringify({ error: "Sunset not found" }), {
        status: 404,
      });
    }

    if (sunset.userId !== session.user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
      });
    }

    // Delete related likes, comments, and sunset
    await prisma.$transaction([
      prisma.like.deleteMany({ where: { sunsetId: params.id } }),
      prisma.comment.deleteMany({ where: { sunsetId: params.id } }),
      prisma.sunset.delete({ where: { id: params.id } }),
    ]);

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete sunset:", error);
    return new Response(JSON.stringify({ error: "Failed to delete sunset" }), {
      status: 500,
    });
  }
}
