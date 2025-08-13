import { Profile, User } from "@prisma/client";
import { ClientUploadedFileData } from "uploadthing/types";

export interface DefaultAuthUser {
  id: string;
  name: string;
  email: string;
  profile?: string;
  role: string;
}

export interface UserResponse {
  profile: {
    imageUrl: ClientUploadedFileData<{
      uploadedBy: string;
    }> | null;
    id: string;
    phoneNumber?: string;
    address?: string;
    bio?: string;
    userId: string;
    locationId?: string;
  };
  email: string;
  id: string;
  role: string;
  name: string;
}
