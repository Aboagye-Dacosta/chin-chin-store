import { ProductGrid } from "@/components/product-grid";
import { Hero } from "@/components/hero";
import { Container } from "@/components/ui/contaner";

export default function HomePage() {
  return (
    <>
      <Hero />
      <main className="py-12">
        <Container>
          <ProductGrid />
        </Container>
      </main>
    </>
  );
}




