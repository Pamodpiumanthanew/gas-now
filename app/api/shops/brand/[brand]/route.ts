import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ brand: string }> }
) {
  try {
    const { brand } = await params;
    
    const shops = await prisma.shop.findMany({
      where: {
        status: "APPROVED",
        isOpen: true,
        OR: [
          { brands: brand.toUpperCase() },
          { brands: "BOTH" }
        ]
      },
      include: {
        reviews: true,
        stocks: {
          include: { gasItem: true }
        }
      }
    });

    return NextResponse.json(shops);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch shops" },
      { status: 500 }
    );
  }
}
