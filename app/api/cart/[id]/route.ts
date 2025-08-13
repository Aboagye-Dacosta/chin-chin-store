import { fetchCartItems } from "@/lib/fetch/fetch-cart";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const params = await ctx.params;
  const cartItems = await fetchCartItems(params.id ?? "");
  return NextResponse.json(cartItems);
}
