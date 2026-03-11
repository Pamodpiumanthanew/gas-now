import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { brand: string } }
) {
  try {
    const brand = params.brand.toUpperCase(); // LAUGFS or LITRO

    const shops = await prisma.shop.findMany({
      where: {
        OR: [
          { brands: brand },
          { brands: "BOTH" }
        ],
        status: "APPROVED" // Only approved shops
      },
      include: {
        stocks: {
          include: {
            gasItem: true
          }
        },
        reviews: true
      }
    });

    return NextResponse.json(shops);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch shops" }, { status: 500 });
  }
}
