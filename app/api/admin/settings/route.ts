import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { adminWhatsapp } = await req.json();

  const settings = await prisma.settings.findFirst();
  
  if (settings) {
    await prisma.settings.update({
      where: { id: settings.id },
      data: { adminWhatsapp }
    });
  } else {
    await prisma.settings.create({
      data: { adminWhatsapp }
    });
  }

  return NextResponse.json({ success: true });
}
