import { prisma } from "../prisma/client";
import { unstable_cache } from "next/cache";

const loadStores = async () => {
    const stores = await prisma.store.findMany({
        include: {
            location: true,
            products: true,
            carts: true,
            vendors: true,
            deliveryCharge: true,
        },
    });
    return stores;
};

export const fetchStores = async () => {
    const response = unstable_cache(() => loadStores(), ["stores"], {
        tags: ["stores"],
    });
    return response();
};


export type Store = Awaited<ReturnType<typeof fetchStores>>;
