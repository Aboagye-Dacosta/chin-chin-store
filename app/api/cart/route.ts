import { fetchCart } from "@/lib/fetch/fetch-cart";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  const storeId = req.nextUrl.searchParams.get("storeId");
  const cart = await fetchCart(email ?? "", storeId ?? "");
  return NextResponse.json(cart);
}
