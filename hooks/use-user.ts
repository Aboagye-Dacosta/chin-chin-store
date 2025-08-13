import { Profile, User } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

type UserResponse = User & {
  profile: Profile | null;
}

export const useUser = (email: string) => {
  const {
    data: user,
    isPending,
    refetch,
  } = useQuery<UserResponse>({
    queryKey: ["user", email],
    queryFn: () => fetch(`/api/me?email=${email}`).then((res) => res.json()),
    enabled: !!email,
    select: (data) => data,
  });

  return { user, isPending, refetchUser: refetch };
};
