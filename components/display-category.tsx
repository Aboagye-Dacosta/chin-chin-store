import { Category } from "@/types/convex-types";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export const DisplayCategory = ({ id }: { id: Category["_id"] }) => {
  const categories = useQuery(api.categories.getCategories);
  const category = categories?.find((cat) => cat._id === id);
  return <>{category?.name}</>;
};
