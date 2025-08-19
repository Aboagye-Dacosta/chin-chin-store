import { OrdersList } from "@/components/orders-list";
import { Container } from "@/components/ui/contaner";

export default async function OrdersPage() {
  return (
    <Container className="container max-w-5xl mx-auto py-8 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-8">Your Orders</h1>
      <OrdersList  />
    </Container>
  );
}
