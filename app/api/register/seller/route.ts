import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password, shopName, phone, address, brands, cylinders } = body;

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Username already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          username,
          password: hashedPassword,
          role: "SELLER",
        },
      });

      const newShop = await tx.shop.create({
        data: {
          userId: newUser.id,
          name: shopName,
          phone,
          address,
          brands,
          status: "PENDING",
        },
      });

      // We don't have GasItem IDs right now unless we fetch them or create them.
      // Usually, Admin populates GasItems. If GasItems exist, we'd link them to ShopStock.
      // For now, this is enough to register the shop.

      return newUser;
    });

    return NextResponse.json({ message: "Seller created successfully, pending approval", userId: user.id });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to register shop" },
      { status: 500 }
    );
  }
}
