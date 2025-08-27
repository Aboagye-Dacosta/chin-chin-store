"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { Container } from "@/components/ui/contaner";
import { memo } from "react";


export const EmptyCart = memo(() => (
  <div className="min-h-screen bg-background">
    <Container className="container mx-auto px-4 py-8">
      <div className="text-center py-16">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">
          Looks like you haven&apos;t added any items to your cart yet.
        </p>
        <Button asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    </Container>
  </div>
));

EmptyCart.displayName = 'EmptyCart';
