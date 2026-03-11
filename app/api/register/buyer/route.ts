import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password, name, address, phone, email } = body;

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

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        address,
        phone,
        email,
        role: "BUYER",
      },
    });

    return NextResponse.json({ message: "Buyer created successfully", userId: user.id });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to register" },
      { status: 500 }
    );
  }
}
