import { ProductManagement } from "@/components/product-management";
import { Protected } from "@/components/protected";

export default function ProductsPage() {
  return (
    <Protected>
      <ProductManagement />
    </Protected>
  );
}
