import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      orders: {
         include: {
            shop: { select: { name: true, phone: true } },
            items: { include: { gasItem: true } }
         },
         orderBy: { createdAt: 'desc' },
         take: 10
      },
      reviews: {
         include: { shop: { select: { name: true } } },
         orderBy: { createdAt: 'desc' }
      }
    }
  });

  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  try {
     const session = await getServerSession(authOptions);
     if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

     const userId = (session.user as any).id;
     const body = await req.json();
     
     // Only allow updating safe string fields
     const updateData: any = {};
     ['name', 'phone', 'address', 'email'].forEach(field => {
        if (body[field] !== undefined) updateData[field] = body[field];
     });

     const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: { id: true, name: true, email: true, phone: true, address: true, role: true }
     });

     return NextResponse.json({ success: true, user });
  } catch (error) {
     return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
