import { unstable_cache } from "next/cache";
import { prisma } from "../prisma/client";

const loadOrders = async (userId: string) => {
  const orders = await prisma.order.findMany({
    where: {
      userId,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  return orders;
};

export const fetchOrders = async (userId: string) => {
  const orders = unstable_cache(loadOrders, [`orders-${userId}`], {
    tags: [userId],
  });
  return orders(userId);
};

export type Orders = Awaited<ReturnType<typeof loadOrders>>;
