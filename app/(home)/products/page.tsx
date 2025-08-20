import { ProductGrid } from "@/components/product-grid";
import { Container } from "@/components/ui/contaner";
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

export default async function ProductsPage() {
  const categories = await fetchQuery(api.categories.getCategories);
  return (
    <Container className="container mx-auto py-8 px-4 md:px-6">
      <ProductGrid categories={categories} />
    </Container>
  );
}
