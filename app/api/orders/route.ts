import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { shopId, isDelivery, deliveryAddress, deliveryFee, items } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    // Process order in a transaction
    const order = await prisma.$transaction(async (tx) => {
      let totalAmount = isDelivery ? deliveryFee : 0;
      const orderItemsData = [];

      for (const item of items) {
        // Find gas item price
        const gasItem = await tx.gasItem.findUnique({ where: { id: item.id } });
        if (!gasItem) throw new Error(`GasItem ${item.id} not found`);

        // Check stock
        const stock = await tx.shopStock.findUnique({
          where: { shopId_gasItemId: { shopId, gasItemId: item.id } }
        });

        if (!stock || stock.quantity < item.quantity) {
          throw new Error(`Not enough stock for ${gasItem.weight}`);
        }

        // Decrement stock
        await tx.shopStock.update({
          where: { id: stock.id },
          data: { quantity: { decrement: item.quantity } }
        });

        const itemTotal = gasItem.price * item.quantity;
        totalAmount += itemTotal;

        orderItemsData.push({
          gasItemId: item.id,
          quantity: item.quantity,
          priceAtTime: gasItem.price
        });
      }

      // Create main order record
      const newOrder = await tx.order.create({
        data: {
          buyerId: userId,
          shopId,
          isDelivery,
          deliveryFee,
          status: "ACCEPTED", // Auto accept for simplicity, can be PENDING.
          totalAmount,
          items: {
            create: orderItemsData
          }
        }
      });

      return newOrder;
    });

    return NextResponse.json({ message: "Order placed successfully", orderId: order.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to place order" }, { status: 500 });
  }
}
