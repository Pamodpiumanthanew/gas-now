import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requests = await prisma.shop.findMany({
    where: { status: "PENDING" },
    include: { user: true }
  });

  return NextResponse.json(requests);
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { shopId, status } = await req.json(); // APPROVED or REJECTED

  const shop = await prisma.shop.update({
    where: { id: shopId },
    data: { status }
  });

  return NextResponse.json({ success: true, shop });
}
