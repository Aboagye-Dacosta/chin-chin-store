import { Products } from "@/lib/fetch/fetch-products";
import { useQuery } from "@tanstack/react-query";

export const useProducts = (storeId: string) => {
  const {
    data: products,
    isLoading,
    error,
  } = useQuery<Products>({
    queryKey: ["products", storeId],
    queryFn: () =>
      fetch(`/api/products?storeId=${storeId}`).then((res) => res.json()),
    enabled: !!storeId,
    retry: 1,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    
  });

  return { products: products ?? [], isLoading, error };
};
