import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  try {
    const messages = await prisma.message.findMany({
      where: { receiverId: userId },
      orderBy: { createdAt: "desc" },
      include: {
         sender: { select: { username: true, role: true } }
      }
    });

    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
   const session = await getServerSession(authOptions);
   if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 
   const userId = (session.user as any).id;
   const { messageIds } = await req.json();

   try {
     if (Array.isArray(messageIds) && messageIds.length > 0) {
        await prisma.message.updateMany({
           where: {
              id: { in: messageIds },
              receiverId: userId
           },
           data: { isRead: true }
        });
     }
 
     return NextResponse.json({ success: true });
   } catch (error) {
     return NextResponse.json({ error: "Failed to update messages" }, { status: 500 });
   }
}
