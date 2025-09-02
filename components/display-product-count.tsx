import { Store } from "@/types/convex-types";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export const DisplayProductCount = ({ id }: { id: Store["_id"] }) => {
  const products = useQuery(api.products.getAllProducts);
  const productCount =
    products?.filter((product) => product.storeId === id).length ?? 0;
  return <>{productCount}</>;
};
