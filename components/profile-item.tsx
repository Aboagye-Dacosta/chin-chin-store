"use client";
import { Button } from "@/components/ui/button";
import { BookUser, LogOut, Package, Shield } from "lucide-react";
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
import { useAuth, UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import ProfileManagement from "./profile-management";

export const ProfileItem = memo(() => {
  const [openSignOutDialog, setOpenSignOutDialog] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { syncServerToCart } = useCart();
  const { store } = useStoreStore();
  const { signOut } = useAuth();
  const user = useQuery(api.users.getCurrentUser);
  const iconStyle = "size-4";

  const handleSyncCart = useCallback(() => {
    startTransition(
      async () =>
        await syncServerToCart(store?._id ?? "").finally(() => {
          signOut();
        })
    );
  }, [store?._id, syncServerToCart]);

  return (
    <>
      <UserButton
        appearance={{
          elements: {
            userButtonPopoverActionButton__signOut: {
              display: "none",
            },
          },
        }}
      >
        <UserButton.MenuItems>
          <UserButton.Link
            labelIcon={<Package className={iconStyle} />}
            label="Orders"
            href="/orders"
          />
          {user?.role !== ROLES.USER && (
            <UserButton.Link
              labelIcon={<Shield className={iconStyle} />}
              label="Admin Dashboard"
              href="/admin"
            />
          )}
          <UserButton.Action
            labelIcon={<LogOut className={iconStyle} />}
            label="signOut"
            onClick={() => setOpenSignOutDialog(true)}
          />
        </UserButton.MenuItems>
        <UserButton.UserProfilePage
          label="Delivery Address"
          labelIcon={<BookUser className={iconStyle}/>}
          url="/delivery-address"
        >
          <ProfileManagement />
        </UserButton.UserProfilePage>
      </UserButton>
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
