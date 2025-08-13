import fetchDeliveryFee from "@/lib/fetch/fetch-delivery-fee";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const storeId = req.nextUrl.searchParams.get("storeId");
    const deliveryFee = await fetchDeliveryFee(storeId ?? "");
    return NextResponse.json(deliveryFee);  
}