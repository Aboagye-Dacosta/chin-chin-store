import { Flex } from "./flex";
import Image from "next/image";

export const IconLogo = () => {
  return (
    <Flex gap="md" className="items-center" direction="row">
      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
        <Image className="font-bold text-sm" src="/logo.png" alt="Logo" width={50} height={50} />
      </div>
      <span className="font-bold text-xl">ChinChin</span>
    </Flex>
  );
};
