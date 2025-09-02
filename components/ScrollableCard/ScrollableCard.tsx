"use client";

import type React from "react";
import { useRef, useEffect, useState, useCallback } from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScrollableCardProps, ScrollState } from "./ScrollableCard.types";

export function ScrollableCard({
  children,
  className,
  maxHeight = "300px",
  maxWidth = "100%",
  scrollStep = 100,
  showScrollIndicators = true,
  contentClassName,
}: Readonly<ScrollableCardProps>) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState<ScrollState>({
    canScrollUp: false,
    canScrollDown: false,
    canScrollLeft: false,
    canScrollRight: false,
  });

  const checkScrollability = useCallback(() => {
    const element = contentRef.current;
    if (!element) return;

    const newState = {
      canScrollUp: element.scrollTop > 0,
      canScrollDown:
        element.scrollTop < element.scrollHeight - element.clientHeight,
      canScrollLeft: element.scrollLeft > 0,
      canScrollRight:
        element.scrollLeft < element.scrollWidth - element.clientWidth,
    };

    setScrollState((prevState) => {
      const hasChanged = Object.keys(newState).some(
        (key) =>
          newState[key as keyof ScrollState] !==
          prevState[key as keyof ScrollState]
      );
      return hasChanged ? newState : prevState;
    });
  }, []);

  useEffect(() => {
    const element = contentRef.current;
    if (!element) return;

    let ticking = false;
    const throttledCheck = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          checkScrollability();
          ticking = false;
        });
        ticking = true;
      }
    };

    checkScrollability();

    element.addEventListener("scroll", throttledCheck, { passive: true });

    const resizeObserver = new ResizeObserver(throttledCheck);
    resizeObserver.observe(element);

    return () => {
      element.removeEventListener("scroll", throttledCheck);
      resizeObserver.disconnect();
    };
  }, [checkScrollability]);

  const scroll = useCallback(
    (direction: "up" | "down" | "left" | "right") => {
      const element = contentRef.current;
      if (!element) return;

      const isVertical = direction === "up" || direction === "down";
      const isPositive = direction === "down" || direction === "right";
      const scrollAmount = isPositive ? scrollStep : -scrollStep;

      element.scrollBy({
        [isVertical ? "top" : "left"]: scrollAmount,
        behavior: "smooth",
      });
    },
    [scrollStep]
  );

  const scrollToEdge = useCallback((edge: "start" | "end") => {
    const element = contentRef.current;
    if (!element) return;

    const isEnd = edge === "end";
    element.scrollTo({
      top: isEnd ? element.scrollHeight : 0,
      left: isEnd ? element.scrollWidth : 0,
      behavior: "smooth",
    });
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (document.activeElement !== contentRef.current) return;

      const keyMap: Record<string, () => void> = {
        ArrowUp: () => scroll("up"),
        ArrowDown: () => scroll("down"),
        ArrowLeft: () => scroll("left"),
        ArrowRight: () => scroll("right"),
        Home: () => scrollToEdge("start"),
        End: () => scrollToEdge("end"),
      };

      const handler = keyMap[event.key];
      if (handler) {
        event.preventDefault();
        handler();
      }
    },
    [scroll, scrollToEdge]
  );

  const ScrollButton = ({
    direction,
    visible,
    position,
  }: {
    direction: "up" | "down" | "left" | "right";
    visible: boolean;
    position: string;
  }) => {
    if (!visible || !showScrollIndicators) return null;

    const icons = {
      up: ChevronUp,
      down: ChevronDown,
      left: ChevronLeft,
      right: ChevronRight,
    };
    const Icon = icons[direction];

    return (
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "absolute z-5 h-[32px] w-[32px] p-0 bg-background/80 backdrop-blur-sm border shadow-sm hover:bg-background/90 transition-opacity",
          position
        )}
        onClick={() => scroll(direction)}
        aria-label={`Scroll ${direction}`}
      >
        <Icon className="h-4 w-4" />
      </Button>
    );
  };

  return (
    <Card className={cn("relative", className)}>
      <CardContent className={cn("p-0 relative", contentClassName)}>
        <ScrollButton
          direction="up"
          visible={scrollState.canScrollUp}
          position="top-2 right-2"
        />
        <ScrollButton
          direction="down"
          visible={scrollState.canScrollDown}
          position="bottom-2 right-2"
        />
        <ScrollButton
          direction="left"
          visible={scrollState.canScrollLeft}
          position="left-2 top-1/2 -translate-y-1/2"
        />
        <ScrollButton
          direction="right"
          visible={scrollState.canScrollRight}
          position="right-2 top-1/2 -translate-y-1/2"
        />

        <div
          ref={contentRef}
          className="overflow-auto h-full scrollbar-hide"
          style={{
            maxHeight,
            maxWidth,
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          role="region"
          aria-label="Scrollable content"
        >
          <div>{children}</div>
        </div>
      </CardContent>
    </Card>
  );
}
