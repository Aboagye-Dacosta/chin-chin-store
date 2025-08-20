import { ProductGrid } from "@/components/product-grid";
import { Hero } from "@/components/hero";
import { Container } from "@/components/ui/contaner";
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

export default async function HomePage() {
  const categories = await fetchQuery(api.categories.getCategories);
  return (
    <>
      <Hero />
      <main className="py-12">
        <Container>
          <ProductGrid categories={categories} />
        </Container>
      </main>
    </>
  );
}
