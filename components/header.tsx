"use client";

import Link from "next/link";
import { Container } from "./ui/contaner";
import Cart from "./cart";
import { IconLogo } from "./ui/icon-logo";
import { LocationSelector } from "./user-location-selector";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton } from "@clerk/nextjs";
import { ProfileItem } from "./profile-item";
import { Flex } from "./ui/flex";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container>
        <Flex direction="col" gap="sm" className="w-full py-2">
          <div className="flex h-16 items-center justify-between w-full">
            <Link href="/" className="flex items-center space-x-2">
              <IconLogo />
            </Link>

            <div className="flex items-center space-x-4">
              <div className="items-center space-x-4 hidden md:flex">
                <Link href="/products" className="flex items-center space-x-2">
                  Products
                </Link>
                <Link href="/orders" className="flex items-center space-x-2">
                  Orders
                </Link>
                <LocationSelector />
              </div>
              <Cart />
              <Authenticated>
                <ProfileItem />
              </Authenticated>
              <Unauthenticated>
                <SignInButton />
              </Unauthenticated>
            </div>
          </div>
          <div className="items-center justify-end space-x-4 flex w-full md:hidden">
            <Link href="/products" className="flex items-center space-x-2">
              Products
            </Link>
            <Link href="/orders" className="flex items-center space-x-2">
              Orders
            </Link>
            <LocationSelector />
          </div>
        </Flex>
      </Container>
    </header>
  );
}
