"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useEffect, useMemo, useTransition, memo } from "react";
import { toast } from "sonner";
import { LoadingSpinner } from "./ui/loading-spinner";
import { useStoreStore } from "@/store/use-store-store";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export const LocationSelector = memo(() => {
  const [isPending, startTransition] = useTransition();
  const { setStore, store } = useStoreStore();
  const stores = useQuery(api.stores.getStores);

  const handleSelectLocation = (id: string) => {
    startTransition(() => {
      const selectedStore = stores?.find((store) => store._id === id);
      if (selectedStore) {
        setStore(selectedStore);
      }
      toast.success("Location updated successfully");
    });
  };

  const defaultStore = useMemo(() => stores?.at(0), [stores]);

  console.log(defaultStore);

  useEffect(() => {
    if (defaultStore) {
      setStore(defaultStore);
    }
  }, [defaultStore, setStore]);

  return (
    <Select
      onValueChange={handleSelectLocation}
      value={store?._id}
      disabled={isPending}
    >
      <SelectTrigger>
        {isPending && <LoadingSpinner className="!w-4 !h-4" />}
        <SelectValue placeholder="choose you location" />
      </SelectTrigger>
      <SelectContent>
        {stores?.map((store) => (
          <SelectItem value={store._id} key={store._id}>
            {store?.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});

LocationSelector.displayName = "LocationSelector";
