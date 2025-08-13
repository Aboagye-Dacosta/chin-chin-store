import { unstable_cache } from "next/cache";
import { prisma } from "../prisma/client";

const loadVendors = async () => {
  return prisma.user.findMany({
    where: {
      role: "VENDOR",
    },
    include: {
      profile: true,
      receivedOrders: true,
      store: {
        include: {
          location: true,
        },
      },
    },
  });
};

export const fetchVendors = () => {
  const vendors = unstable_cache(loadVendors, ["vendors"], {
    tags: ["vendors"],
    revalidate: 5 * 60 * 1000,
  });

  return vendors();
};

export type Vendors = Awaited<ReturnType<typeof loadVendors>>;
