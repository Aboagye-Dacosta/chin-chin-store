"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useEffect, useMemo, useTransition, memo, useState } from "react";
import { toast } from "sonner";
import { LoadingSpinner } from "./ui/loading-spinner";
import { useStoreStore } from "@/store/use-store-store";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Flex } from "./ui/flex";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { StoreDetailCard } from "./store-detail-card";
import { Label } from "./ui/label";

export const LocationSelector = memo(() => {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
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

  useEffect(() => {
    if (defaultStore) {
      setStore(defaultStore);
    }
  }, [defaultStore, setStore]);

  return (
    <>
      <Flex direction="row" gap="sm" align="center">
        <Label htmlFor="store">Store</Label>
        <Select
          onValueChange={handleSelectLocation}
          value={store?._id}
          disabled={isPending}
        >
          <SelectTrigger id="store">
            {isPending && <LoadingSpinner className="!w-4 !h-4" />}
            <SelectValue placeholder="choose you location" />
          </SelectTrigger>
          <SelectContent>
            {stores?.map((store) => (
              <SelectItem value={store._id} key={store._id}>
                {store?.name} - {store?.location?.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
              <Info />
            </Button> */}
      </Flex>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Details on store</DialogTitle>
          </DialogHeader>
          <StoreDetailCard store={store} />
        </DialogContent>
      </Dialog>
    </>
  );
});

LocationSelector.displayName = "LocationSelector";
