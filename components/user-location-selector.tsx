"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useEffect, useMemo, memo, useState } from "react";
import { useStoreStore } from "@/store/use-store-store";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Flex } from "./ui/flex";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { StoreDetailCard } from "./store-detail-card";
import { Label } from "./ui/label";

export const LocationSelector = memo(() => {
  const [open, setOpen] = useState(false);
  const { setStore, store } = useStoreStore();
  const stores = useQuery(api.stores.getUserStores);

  const handleSelectLocation = async (id: string) => {
    const selectedStore = stores?.find((store) => store._id === id);
    if (selectedStore) {
      setStore(selectedStore);
    }
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
        <Select onValueChange={handleSelectLocation} value={store?._id}>
          <SelectTrigger id="store">
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
