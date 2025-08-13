import { ClientUploadedFileData } from "uploadthing/types";

export const parseImage = (
  jsonString: string
): ClientUploadedFileData<{
  uploadedBy: string;
}> | null => {
  if (!jsonString) return null;
  const parsedData = JSON.parse(jsonString);
  return parsedData;
};
