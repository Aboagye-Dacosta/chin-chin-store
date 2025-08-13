import { cn } from "@/lib/utils";

export const Container = ({
  children,
  className,
}: Readonly<{ children: React.ReactNode; className?: string }>) => {
  return (
    <div
      className={cn(
        "container max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8",
        className
      )}
    >
      {children}
    </div>
  );
};
