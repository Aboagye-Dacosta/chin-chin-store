import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json(); 
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
  const hasCart = cart !== null;

  if (!hasCart) {
    await prisma.cart.create({
      data: {
        userId: user.id,
        storeId: body.storeId,
        items: {
          create: body.map((item: { productId: string; quantity: number }) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
    });
  } else {
    for (const item of body) {
      const existing = await prisma.cartItem.findFirst({
        where: { cartId: cart?.id, productId: item.productId },
      });

      if (existing) {
        await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + item.quantity },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: cart.id ?? "",
            productId: item.productId,
            quantity: item.quantity,
          },
        });
      }
    }
  }

  return NextResponse.json({ success: true });
}
