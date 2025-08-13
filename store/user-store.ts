import { User } from "@/lib/fetch/fetch-user";
import { parseImage } from "@/lib/parse-image";
import { ClientUploadedFileData } from "uploadthing/types";
import { create } from "zustand";

interface NewUser extends NonNullable<User> {
    profile: NonNullable<User>["profile"] & {
        imageUrl: ClientUploadedFileData<{ uploadedBy: string }> | null;
    };
}

interface UserState {
  user: NewUser | null;
}

interface UserActions {
  setUser: (user: User) => void;
  clearUser: () => void;
}
type UserStore = UserState & UserActions;

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user: User) => {
    if (!user) return set(() => ({ user: null }));
    const { profile, ...rest } = user;
    const imageUrl = parseImage((profile?.imageUrl as unknown as string) ?? "");
    const newUser = {
        ...rest,
        profile: {
            ...profile,
            imageUrl,
        },
    }
    set(() => ({ user: newUser }));
  },
  clearUser: () => set(() => ({ user: null })),
}));
