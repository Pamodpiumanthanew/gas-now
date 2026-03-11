import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "SELLER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const shop = await prisma.shop.findUnique({
    where: { userId },
    include: {
      stocks: { include: { gasItem: true } },
      orders: {
         include: {
            buyer: { select: { username: true, name: true, phone: true } },
            items: { include: { gasItem: true } }
         },
         orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!shop) return NextResponse.json({ error: "Shop not found" }, { status: 404 });

  // Auto-seed GasItems if they don't exist
  let gasItems = await prisma.gasItem.findMany();
  if (gasItems.length === 0) {
     await prisma.gasItem.createMany({
        data: [
           { brand: "LAUGFS", weight: "12.5kg", price: 3690 },
           { brand: "LAUGFS", weight: "5kg", price: 1476 },
           { brand: "LAUGFS", weight: "2kg", price: 590 },
           { brand: "LITRO", weight: "12.5kg", price: 3690 },
           { brand: "LITRO", weight: "5kg", price: 1476 },
           { brand: "LITRO", weight: "2.3kg", price: 680 },
        ]
     });
     gasItems = await prisma.gasItem.findMany();
  }

  // Auto-create ShopStocks for the seller based on their brand
  if (shop.stocks.length === 0) {
      const targetBrands = shop.brands === "BOTH" ? ["LAUGFS", "LITRO"] : [shop.brands];
      const itemsToAdd = gasItems.filter(item => targetBrands.includes(item.brand));
      
      if (itemsToAdd.length > 0) {
         await prisma.shopStock.createMany({
            data: itemsToAdd.map(item => ({
               shopId: shop.id,
               gasItemId: item.id,
               quantity: 0
            }))
         });
         
         // Re-fetch shop with new stocks
         const updatedShop = await prisma.shop.findUnique({
            where: { id: shop.id },
            include: {
               stocks: { include: { gasItem: true } },
               orders: { include: { buyer: { select: { username: true, name: true, phone: true } }, items: { include: { gasItem: true } } }, orderBy: { createdAt: 'desc' } }
            }
         });
         return NextResponse.json(updatedShop);
      }
  }

  return NextResponse.json(shop);
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "SELLER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const { action, shopId, payload } = await req.json();

  if (action === "UPDATE_SHOP") {
     const { isOpen, openTime, closeTime, whatsapp } = payload;
     const shop = await prisma.shop.update({
        where: { id: shopId, userId },
        data: { isOpen, openTime, closeTime, whatsapp }
     });
     return NextResponse.json({ success: true, shop });
  }

  if (action === "UPDATE_STOCK") {
     const { stockId, quantity } = payload;
     // Verify ownership implicitly
     const stock = await prisma.shopStock.update({
        where: { id: stockId },
        data: { quantity: parseInt(quantity) }
     });
     return NextResponse.json({ success: true, stock });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
