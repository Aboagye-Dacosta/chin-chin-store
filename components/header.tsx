"use client";

import Link from "next/link";
import { Container } from "./ui/contaner";
import Cart from "./cart";
import { IconLogo } from "./ui/icon-logo";
import { LocationSelector } from "./user-location-selector";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton } from "@clerk/nextjs";
import { ProfileItem } from "./profile-item";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <IconLogo />
          </Link>

          <div className="flex items-center space-x-4">
            <LocationSelector />
            <Cart />
            <Authenticated>
              <ProfileItem />
            </Authenticated>
            <Unauthenticated>
              <SignInButton />
            </Unauthenticated>
          </div>
        </div>
      </Container>
    </header>
  );
}
