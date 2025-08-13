"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import Link from "next/link";
import { ROLES } from "@/constants/roles";
import { memo, useCallback, useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { useCart } from "@/hooks/use-cart";
import { useStoreStore } from "@/store/use-store-store";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export const ProfileItem = memo(() => {
  const [openSignOutDialog, setOpenSignOutDialog] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { syncServerToCart } = useCart();
  const { store } = useStoreStore();
  const { signOut } = useAuth();
  const user = useQuery(api.users.getCurrentUser);

  const handleSyncCart = useCallback(() => {
    startTransition(
      async () =>
        await syncServerToCart(store?._id ?? "").finally(() => {
          signOut();
          setOpenSignOutDialog(false);
        })
    );
  }, [store?._id, syncServerToCart]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="flex items-center justify-center"
          >
            <User className="!h-5 !w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href="/profile">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/orders">Orders</Link>
          </DropdownMenuItem>
          {user?.role !== ROLES.USER && (
            <DropdownMenuItem asChild>
              <Link href="/admin">Admin Dashboard</Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setOpenSignOutDialog(true)}>
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {openSignOutDialog && (
        <Dialog open={openSignOutDialog} onOpenChange={setOpenSignOutDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sign Out</DialogTitle>
              <DialogDescription>
                Are you sure you want to sign out?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpenSignOutDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSyncCart}
                disabled={isPending}
                loading={isPending}
              >
                Sign Out
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
});

ProfileItem.displayName = "ProfileItem";
