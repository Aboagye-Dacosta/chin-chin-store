import { toast } from "sonner";

export const handleStatus = ({
  success,
  message,
}: {
  success: boolean;
  message: string;
}) => {
  if (success) {
    toast.success(message);
  } else {
    toast.error(message);
  }
};
