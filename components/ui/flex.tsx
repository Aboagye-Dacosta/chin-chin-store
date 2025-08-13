import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";

const flexVariant = cva("flex", {
  variants: {
    direction: {
      row: "flex-row",
      col: "flex-col",
    },
    justify: {
      center: "justify-center",
      between: "justify-between",
      around: "justify-around",
      even: "justify-evenly",
      start: "justify-start",
      end: "justify-end",
    },
    align: {
      center: "items-center",
      between: "items-between",
      around: "items-around",
      even: "items-evenly",
      start: "items-start",
      end: "items-end",
    },
    gap: {
      sm: "gap-1",
      md: "gap-2",
      lg: "gap-3",
      xl: "gap-4",
    },
    wrap: {
      true: "flex-wrap",
      false: "flex-nowrap",
    },
    shrink: {
      true: "shrink",
      false: "shrink-0",
    },
    grow: {
      true: "grow",
      false: "grow-0",
    },
    basis: {
      auto: "basis-auto",
      full: "basis-full",
    },
  },
  defaultVariants: {
    direction: "row",
    justify: "start",
    align: "start",
    gap: "md",
    wrap: false,
    shrink: false,
    grow: false,
    basis: "auto",
  },
});

type FlexVariantProps = VariantProps<typeof flexVariant>;

interface FlexProps
  extends React.HTMLAttributes<HTMLDivElement>,
    FlexVariantProps {
  direction: "row" | "col";
  children: React.ReactNode;
}

export const Flex = ({
  className,
  direction,
  justify,
  align,
  gap,
  wrap,
  shrink,
  grow,
  basis,
  ...props
}: FlexProps) => {
  return (
    <div
      className={cn(
        flexVariant({
          direction,
          justify,
          align,
          gap,
          wrap,
          shrink,
          grow,
          basis,
        }),
        className
      )}
      {...props}
    />
  );
};
