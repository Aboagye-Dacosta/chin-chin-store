"use client";
import { ProductGrid } from "@/components/product-grid";
import { Container } from "@/components/ui/contaner";

export default function ProductsPage() {
  return (
    <Container className="container mx-auto py-8 px-4 md:px-6">
      <ProductGrid />
    </Container>
  );
}
