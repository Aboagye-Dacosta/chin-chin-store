"use server";
import { prisma } from "@/lib/prisma/client";
import { CartItems, fetchCart, fetchCartMini } from "@/lib/fetch/fetch-cart";

export const serverAddItem = async (
  cartId: string,
  item: CartItems[number]["product"],
  userId: string,
  storeId: string,
) => {
  console.log(cartId, userId, storeId);
  let myCartId = cartId;
  if (!myCartId) {
    const cart = await fetchCartMini(userId, storeId); 
    myCartId = cart?.id ?? "";
  }
  await prisma.cartItem.upsert({
    where: { cartId: myCartId, productId: item.id },
    update: { quantity: { increment: 1 } },
    create: {
      cartId: myCartId,
      productId: item.id,
      quantity: 1,
    },
  });
};

export const serverRemoveItem = async (cartItemId: string) => {
  await prisma.cartItem.delete({
    where: { id: cartItemId },
  });
};

export const serverUpdateQuantity = async (
  cartItemId: string,
  quantity: number
) => {
  await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
  });
};

export const serverClearCart = async (userId: string, storeId: string) => {
  const cart = await fetchCartMini(userId, storeId);
  await prisma.cartItem.deleteMany({ where: { cartId: cart?.id } });
};

export const serverGetCart = async (userId: string, storeId: string) => {
  const cart = await fetchCart(userId, storeId);
  return cart;
};

export const serverSyncCart = async (
  userId: string,
  storeId: string,
  productId: string,
  existingQuantity?: number,
  quantity?: number
) => {
  const cart = await fetchCartMini(userId, storeId);
  await prisma.cartItem.upsert({
    where: { cartId: cart?.id, productId: productId },
    update: { quantity: { increment: (quantity ?? 1) - (existingQuantity ?? 0) } },
    create: {
      cartId: cart?.id ?? "",
      productId: productId,
      quantity: (quantity ?? 1) - (existingQuantity ?? 0),
    },
  });

  return cart;
};
