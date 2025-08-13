"use server";

import { revalidateTag } from "next/cache";
import { UTApi } from "uploadthing/server";

const deleteProfileImage = async (key: string) => {
  try {
    const utApi = new UTApi();
    await utApi.deleteFiles([key]);
    revalidateTag("user");
  } catch (error) {
    console.log(error);
  }
};

export default deleteProfileImage;
