import { useFormStatus } from "react-dom";
import { Button } from "./ui/button";

export const SubmitButton = ({ children }: React.PropsWithChildren) => {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      className="w-full"
      disabled={pending}
      loading={pending}
    >
      {children}
    </Button>
  );
};
