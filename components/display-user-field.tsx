import { User } from "@/types/convex-types";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export const DisplayUserField = ({
  userId,
  field,
}: {
  userId: User["_id"];
  field: keyof User;
}) => {
  const user = useQuery(api.users.getUser, { userId });
  return <>{user?.[field]}</>;
};
//
