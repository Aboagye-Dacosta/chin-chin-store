import { OrdersList } from "@/components/orders-list";
import { getServerSession } from "next-auth";
import { fetchUser } from "@/lib/fetch/fetch-user";
import { fetchOrders } from "@/lib/fetch/fetch-orders";
import { Container } from "@/components/ui/contaner";

export default async function OrdersPage() {
  const session = await getServerSession();
  const user = await fetchUser(session?.user?.email ?? "");
  const orders = await fetchOrders(user?.id ?? "");

  return (
    <Container className="container mx-auto py-8 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-8">Your Orders</h1>
      <OrdersList orders={orders} />
    </Container>
  );
}
