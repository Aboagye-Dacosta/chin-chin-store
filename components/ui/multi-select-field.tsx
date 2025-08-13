import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";

export type MultiSelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

export type MultiSelectProps = {
  options: MultiSelectOption[];
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  /** Controls height of the options list */
  maxHeight?: number;
};

const useTriggerWidth = () => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = React.useState<number | null>(null);

  React.useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(() => {
      if (ref.current) setWidth(ref.current.getBoundingClientRect().width);
    });
    ro.observe(ref.current);
    setWidth(ref.current.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  return { ref, width } as const;
};

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select options",
  searchPlaceholder = "Search...",
  emptyMessage = "No results",
  disabled,
  className,
  maxHeight = 260,
}: Readonly<MultiSelectProps>) {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);
  const { ref: triggerRef, width } = useTriggerWidth();
  const selectedSet = React.useMemo(() => new Set(value), [value]);

  const toggleValue = (val: string) => {
    const next = new Set(selectedSet);
    if (next.has(val)) next.delete(val);
    else next.add(val);
    onChange(Array.from(next));
  };

  const clearAll = () => onChange([]);

  const renderChips = () => {
    if (!value?.length) {
      return (
        <span className="text-muted-foreground">{placeholder}</span>
      );
    }
    const selectedOptions = options.filter((o) => selectedSet.has(o.value));
    return (
      <div className="flex flex-wrap gap-1.5">
        {selectedOptions.map((opt) => (
          <Badge
            key={opt.value}
            variant="secondary"
            className="px-2 py-0.5"
          >
            <span className="mr-1">{opt.label}</span>
            <button
              type="button"
              aria-label={`Remove ${opt.label}`}
              className="inline-flex items-center justify-center rounded-[4px] hover:bg-muted transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                toggleValue(opt.value);
              }}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </Badge>
        ))}
      </div>
    );
  };

  const list = (
    <Command>
      <CommandInput placeholder={searchPlaceholder} />
      <CommandList>
        <CommandEmpty>{emptyMessage}</CommandEmpty>
        <CommandGroup>
          <ScrollArea style={{ maxHeight }} className="pr-1">
            {options.map((opt) => {
              const checked = selectedSet.has(opt.value);
              return (
                <CommandItem
                  key={opt.value}
                  disabled={opt.disabled}
                  onSelect={() => toggleValue(opt.value)}
                  className="cursor-pointer"
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                      checked
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background"
                    )}
                  >
                    {checked && <Check className="h-3 w-3" />}
                  </div>
                  <span className={cn(opt.disabled && "opacity-50")}>{opt.label}</span>
                </CommandItem>
              );
            })}
          </ScrollArea>
        </CommandGroup>
      </CommandList>
    </Command>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <div
            ref={triggerRef}
            aria-disabled={disabled}
            className={cn(
              "flex min-h-10 w-full items-center justify-between gap-2 rounded-md border bg-background px-3 py-2 text-sm ring-offset-background",
              "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
              disabled && "opacity-50 cursor-not-allowed",
              className
            )}
            role="button"
            tabIndex={disabled ? -1 : 0}
          >
            <div className="flex flex-1 flex-wrap items-center gap-1.5 text-left">
              {renderChips()}
            </div>
            <ChevronsUpDown className="h-4 w-4 opacity-60" />
          </div>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Select options</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-2">{list}</div>
          <DrawerFooter>
            <div className="flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={clearAll}
              >
                Clear
              </Button>
              <Button type="button" onClick={() => setOpen(false)}>
                Done
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          ref={triggerRef}
          aria-disabled={disabled}
          className={cn(
            "flex min-h-10 w-full items-center justify-between gap-2 rounded-md border bg-background px-3 py-2 text-sm ring-offset-background",
            "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          role="button"
          tabIndex={disabled ? -1 : 0}
        >
          <div className="flex flex-1 flex-wrap items-center gap-1.5 text-left">
            {renderChips()}
          </div>
          <ChevronsUpDown className="h-4 w-4 opacity-60" />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 z-50 bg-popover"
        align="start"
        style={{ width: width ?? undefined }}
      >
        {list}
        <div className="flex items-center justify-between border-t p-2">
          <Button type="button" variant="secondary" onClick={clearAll}>
            Clear
          </Button>
          <Button type="button" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
