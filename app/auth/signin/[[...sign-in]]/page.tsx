import { Flex } from "@/components/ui/flex";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <Flex
      direction="row"
      gap="md"
      align="center"
      justify="center"
      className="min-h-screen w-full"
    >
      <SignIn path="/auth/signin" afterSignOutUrl="/" />
    </Flex>
  );
}
