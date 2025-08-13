"use client";
import { User } from "@/lib/fetch/fetch-user";
import { useUserStore } from "@/store/user-store";
import { useEffect } from "react";

export const UserProvider = ({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User;
}) => {
  const { setUser } = useUserStore();
  useEffect(() => {
    if (user) {
      const currentUser = useUserStore.getState().user;
      if (JSON.stringify(currentUser) !== JSON.stringify(user)) {
        setUser(user);
      }
    }
  }, [user, setUser]);
  return <>{children}</>;
};
