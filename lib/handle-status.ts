import { ConvexError } from "convex/values";
import { toast } from "sonner";

export const handleStatus = ({
  success,
  message,
  error,
}: {
  success?: boolean;
  message?: string;
  error?: unknown;
}) => {
  if (success) {
    toast.success(message);
  } else if (error) {
    if (error instanceof ConvexError) {
      toast.error(error.data);
    } else {
      toast.error((error as Error).message);
    }
  } else {
    toast.error(message);
  }
};
