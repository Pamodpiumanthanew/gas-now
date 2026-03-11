import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify user exists and is not admin
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (targetUser.role === "ADMIN") return NextResponse.json({ error: "Cannot delete admin" }, { status: 400 });

    // SQLite workaround: manually delete relations in a transaction to avoid nested foreign key constraint errors
    await prisma.$transaction(async (tx) => {
       // Messages where this user is sender or receiver
       await tx.message.deleteMany({ where: { OR: [{ senderId: id }, { receiverId: id }] } });

       if (targetUser.role === "SELLER") {
          const shop = await tx.shop.findUnique({ where: { userId: id } });
          if (shop) {
             // Delete shop relations
             await tx.shopStock.deleteMany({ where: { shopId: shop.id } });
             await tx.orderItem.deleteMany({ where: { order: { shopId: shop.id } } });
             await tx.order.deleteMany({ where: { shopId: shop.id } });
             await tx.review.deleteMany({ where: { shopId: shop.id } });
             // Finally delete shop
             await tx.shop.delete({ where: { id: shop.id } });
          }
       } else if (targetUser.role === "BUYER") {
          await tx.orderItem.deleteMany({ where: { order: { buyerId: id } } });
          await tx.order.deleteMany({ where: { buyerId: id } });
          await tx.review.deleteMany({ where: { buyerId: id } });
       }
       
       await tx.user.delete({ where: { id } });
    });

    return NextResponse.json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error("DELETE user error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
   req: Request,
   { params }: { params: Promise<{ id: string }> }
 ) {
   try {
     const session = await getServerSession(authOptions);
     if (!session?.user || (session.user as any).role !== "ADMIN") {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
     }
 
     const { id } = await params;
     const { content } = await req.json();

     if (!content || typeof content !== "string") {
        return NextResponse.json({ error: "Message content is required" }, { status: 400 });
     }
 
     const targetUser = await prisma.user.findUnique({ where: { id } });
     if (!targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
 
     // Create the message
     const message = await prisma.message.create({
        data: {
           senderId: (session.user as any).id,
           receiverId: id,
           content
        }
     });
 
     return NextResponse.json(message);
   } catch (error) {
     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
   }
 }
