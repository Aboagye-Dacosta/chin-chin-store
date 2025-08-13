import { revalidateTag, unstable_cache } from "next/cache";
import { prisma } from "../prisma/client";

const loadCartMini = async (id: string, storeId: string) => {
  let cart = await prisma.cart.findUnique({
    where: {
      userId: id,
    },
  });

  const hadCart = !!cart;
  if (!hadCart) {
    cart = await prisma.cart.create({
      data: {
        userId: id,
        storeId: storeId,
      },
    });
  }

  return cart;
};

const loadCart = async (userId: string, storeId: string) => {
  let cart = await prisma.cart.findUnique({
    where: {
      userId: userId,
      storeId: storeId,
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });

  const hadCart = !!cart;
  if (!hadCart) {
    cart = await prisma.cart.create({
      data: {
        userId: userId,
        storeId: storeId,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });
  }
  return cart;
};

export const fetchCart = async (userId: string, storeId: string) => {
  revalidateTag("cart");
  const cart = unstable_cache(loadCart, [`cart-${userId}-${storeId}`], {
    tags: ["cart"],
  });
  return cart(userId, storeId);
};

export const fetchCartMini = async (userId: string, storeId: string) => {
  const cart = unstable_cache(loadCartMini, [`cart-mini-${userId}`], {
    tags: ["cart-mini"],
  });
  return cart(userId, storeId);
};

export const fetchCartItems = async (cartId: string) => {
  const cartItems = await prisma.cartItem.findMany({
    where: {
      cartId: cartId,
    },
    include: {
      product: {
        include: {
          category: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return cartItems;
};


export interface CartItem extends NonNullable<Awaited<ReturnType<typeof fetchCartItems>>[number]> {
  existingQuantity?: number;
}

export type CartItems = CartItem[];

export type Cart = Omit<Awaited<ReturnType<typeof loadCart>> ,"items"> & { items: CartItems, id: string };