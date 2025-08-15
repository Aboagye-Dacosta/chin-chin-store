"use client";

import { Button } from "./ui/button";
import { Moon, Sun, Undo2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Flex } from "./ui/flex";
import { ColorPicker } from "./color-picker";
import { useAppThemeStore } from "@/store/use-app-theme";
import { useTheme } from "next-themes";

export const AppThemeFloatingActionButton = () => {
  const categories = useQuery(api.categories.getCategories);
  const { appColor, categoryColors, setAppColor, setCategoryColors, reset } =
    useAppThemeStore();
  const { theme, setTheme } = useTheme();
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 z-50"
        >
          <div
            className="h-6 w-6 rounded-full"
            style={{ backgroundColor: appColor }}
          ></div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="left">
        <Flex direction="row" gap="md" justify="between">
          <Flex direction="row" gap="md" className="flex-1">
            {categories?.map((category) => (
              <ColorPicker
                key={category._id}
                showValue={false}
                showLabel={false}
                variant="ghost"
                className="w-min p-0"
                value={categoryColors[category.name] ?? category.color}
                onChange={(value) => {
                  setCategoryColors({
                    ...categoryColors,
                    [category.name]: value,
                  });
                }}
              />
            ))}
          </Flex>
          <Flex direction="row" gap="md" align="center" justify="center">
            <div className="h-[24px] bg-primary w-[1px]" />
            <ColorPicker
              showValue={false}
              showLabel={false}
              variant="ghost"
              className="w-min p-0"
              value={appColor}
              onChange={(value) => {
                setAppColor(value);
              }}
            />
            <Button
              variant="ghost"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun /> : <Moon />}
            </Button>
            <Button variant="ghost" onClick={() => reset()}>
              <Undo2 />
            </Button>
          </Flex>
        </Flex>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
