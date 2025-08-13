"use client";
import { ROLES } from "@/constants/roles";
import { redirect } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, isLoaded } = useAuth();
  const user = useQuery(api.users.getCurrentUser);

  useEffect(() => {
    if (!isSignedIn && isLoaded) {
      redirect("/");
    }
  }, [isSignedIn, isLoaded]);

  useEffect(() => {
    if (user && user.role == ROLES.USER) {
      redirect("/");
    }
  }, [user]);

  if (!isLoaded && !user) {
    return null;
  }

  return <>{children}</>;
};
