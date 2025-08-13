import { useQuery } from "@tanstack/react-query";
import { CartItems } from "@/lib/fetch/fetch-cart";

export function useCartItems(cartId: string) {
  const { data, isLoading,isPending, error } = useQuery<CartItems>({
    queryKey: ["cart-items", cartId],
    queryFn: () => fetch(`/api/cart/${cartId}`).then((res) => res.json()),
    enabled: !!cartId,
    retry: 1,
    staleTime: Infinity,
    refetchOnMount: false,
  });

  return { data: data ?? [], isLoading: isLoading && isPending, error };
}
