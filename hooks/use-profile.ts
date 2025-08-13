import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProfileSchema } from "@/schema/profile-schema";
import { toast } from "sonner";
import { useUserStore } from "@/store/user-store";

export const useProfile = () => {
  const { user } = useUserStore();
  const queryClient = useQueryClient();
  const { mutateAsync: updateProfile, isPending: isLoading } = useMutation({
    mutationFn: (profile: ProfileSchema) =>
      fetch(`/api/me`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...profile, userId: user?.id }),
      }).then((res) => res.json()),
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return { updateProfile, isLoading };
};
