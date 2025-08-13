import { prisma } from "../prisma/client";
import { parseImage } from "../parse-image";
import { unstable_cache } from "next/cache";

const loadUser = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      profile: true,
      cart: {
        include: {
          store: {
            include: {
              location: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  const { profile, ...rest } = user;

  return {
    ...rest,
    profile: {
      ...profile,
      imageUrl: parseImage(profile?.imageUrl ?? ""),
    },
  };
};

export const fetchUser = async (email: string) => {
  const response = unstable_cache(() => loadUser(email), [`user-${email}`], {
    tags: ["user"],
  });

  return response();
};

export type User = Awaited<ReturnType<typeof fetchUser>>;

export type Carts = NonNullable<User>["cart"];