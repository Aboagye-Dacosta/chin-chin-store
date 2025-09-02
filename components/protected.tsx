"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ROLES } from "@/constants/roles";
import NotAuthorised from "./not-authorised";

export const Protected = ({ children }: { children: React.ReactNode }) => {
  const currentUser = useQuery(api.users.getCurrentUser);

  if (!currentUser) {
    return null;
  }

  if (currentUser.role === ROLES.VENDOR) {
    return <NotAuthorised />;
  }

  return <>{children}</>;
};
