import { unstable_cache } from "next/cache";
import { prisma } from "../prisma/client";

export const loadProducts = async () => {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      store: true,
    },
  });
  return products ?? [];
};

export const loadProductsByStoreId = async (storeId: string) => {
  const products = await prisma.product.findMany({
    where: {
      storeId: storeId,
    },
    include: {
      category: true,
      store: true,
    },
  });
  return products ?? [];
};

export const fetchProducts = async () => {
  const products = unstable_cache(loadProducts, ["products"], {
    tags: ["products"],
  });
  return products();
};

export const fetchProductsByStoreId = async (storeId: string) => {
  const products = unstable_cache(loadProducts, ["products"], {
    tags: ["products"],
  });
  return products();
};

export type Products = Awaited<ReturnType<typeof loadProducts>>;
