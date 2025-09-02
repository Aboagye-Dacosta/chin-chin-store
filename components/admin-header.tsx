import { Flex } from "./ui/flex";
import { UserButton } from "@clerk/nextjs";

export function AdminHeader() {
  return (
    <Flex
      direction="row"
      justify="end"
      align="center"
      className="p-4 shadow-sm w-full"
    >
      <UserButton />
    </Flex>
  );
}
