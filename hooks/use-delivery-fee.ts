import { useQuery } from "@tanstack/react-query";
import { DeliveryFee } from "@/lib/fetch/fetch-delivery-fee";

export const useDeliveryFee = (storeId: string) => {
    const { data, isLoading, error } = useQuery<DeliveryFee>({
        queryKey: ["delivery-fee", storeId],
        queryFn: () => fetch(`/api/delivery-fee?storeId=${storeId}`).then((res) => res.json()),
        enabled: !!storeId,
        retry: 1,
        staleTime: 60 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    return { deliveryFee: data?.amount ?? 0, isLoading, error };
};