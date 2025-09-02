import { Flex } from "@/components/ui/flex";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <Flex
      direction="row"
      gap="md"
      align="center"
      justify="center"
      className="min-h-screen w-full"
    >
      <SignUp path="/auth/signup" afterSignOutUrl="/" />
    </Flex>
  );
}
