import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { LogOut, RefreshCw } from "lucide-react";
import { Flex } from "../ui/flex";
import { Button } from "../ui/button";
import { signOut } from "next-auth/react";
import { IconLogo } from "../ui/icon-logo";

export interface ErrorCardProps {
  onRetry?: () => void;
  title?: string;
  error?: Error;
}

export const ErrorCard = ({
  onRetry,
  title = "Something went wrong, but don't fret. it's not your fault",
  error,
}: ErrorCardProps) => {
  return (
    <Card className="bg-blue-25 mx-auto min-w-[300px] w-fit gap-2">
      <CardHeader className="items-center justify-center">
        <IconLogo />
      </CardHeader>
      <CardContent className="w-fit px-4 py-6 lg:px-24">
        <Flex direction="col">
          <h1 className="text-2xl font-semibold">Error</h1>
          <p className="text-gray-500">{error?.message ?? title}</p>
          <p className="text-gray-500">Let&apos;s try again</p>
        </Flex>
      </CardContent>
      <CardFooter>
        <Flex gap={"lg"} direction="col" className="w-full px-4 lg:px-12">
          <Button onClick={onRetry} className="w-full" size="sm">
            <RefreshCw /> Retry
          </Button>
          <Button
            onClick={() => signOut()}
            variant="destructive"
            className="w-full"
            size="sm"
          >
            <LogOut /> Logout
          </Button>
        </Flex>
      </CardFooter>
    </Card>
  );
};
