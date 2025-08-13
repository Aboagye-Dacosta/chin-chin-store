import { prisma } from "../prisma/client";
import { unstable_cache } from "next/cache";

export const loadCategories = async () => {
  const categories = await prisma.category.findMany();
  return categories;
};

export const fetchCategories = async () => {
  const categories = unstable_cache(loadCategories, ["categories"], {
    tags: ["categories"],
  });
  return categories();
};

export type Categories = Awaited<ReturnType<typeof loadCategories>>;
