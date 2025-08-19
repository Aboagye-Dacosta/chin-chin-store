import UserOrderDetails from "@/components/orders/user-order-details";

export default async function OrderPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  return <UserOrderDetails orderId={id} />;
}
