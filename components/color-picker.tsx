import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { HexColorPicker } from "react-colorful";
import { cn } from "@/lib/utils";
import { Label } from "./ui/label";

export const ColorPicker = ({
  value = "#000000",
  onChange,
  className,
  label,
  showLabel = true,
  showValue = true,
  variant = "outline",
}: {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  label?: string;
  showLabel?: boolean;
  showValue?: boolean;
  variant?: "outline" | "default" | "ghost";
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          className={cn("w-max justify-start text-left", className)}
        >
          {value && (
            <div className="flex items-center gap-2">
              <div
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: value }}
              />
              {showValue && <span>{value}</span>}
            </div>
          )}
          {showLabel && !value && <Label>{label}</Label>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-[24px]">
        <div className="mt-2 rounded-xl border p-3">
          <HexColorPicker
            color={value || "#000000"}
            onChange={(val: string) => onChange(val)}
          />
        </div>

        <div className="mt-3 flex items-center gap-3">
          <Input
            value={value || "#000000"}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000"
            className="font-mono"
          />
          <div
            className="h-9 w-9 rounded-md border"
            style={{
              backgroundColor: value || "#000000",
            }}
            aria-label="Selected color preview"
            title={value || "#000000"}
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
