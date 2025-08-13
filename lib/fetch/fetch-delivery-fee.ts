import { prisma } from "../prisma/client";

const loadDeliveryFee = async (storeId: string) => {
  const deliveryFee = await prisma.deliveryCharge.findUnique({
    where: {
      storeId,
    },
  });

  return deliveryFee;
};

export default loadDeliveryFee;

export type DeliveryFee = Awaited<ReturnType<typeof loadDeliveryFee>>;