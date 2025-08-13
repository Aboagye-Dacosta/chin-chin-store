"use client";
import { Container } from "@/components/ui/contaner";
import { OrdersList } from "./orders-list";
import { fetchOrders } from "@/lib/fetch/fetch-orders";
export async function Orders({ userId }: Readonly<{ userId: string }>) {
  const orders = await fetchOrders(userId);
  return (
    <Container className="container mx-auto py-8 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-8">Your Orders</h1>
      <OrdersList orders={orders} />
    </Container>
  );
}
