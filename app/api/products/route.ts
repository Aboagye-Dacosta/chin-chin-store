import { loadProductsByStoreId } from '@/lib/fetch/fetch-products';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const storeId = req.nextUrl.searchParams.get("storeId");
    const product = await loadProductsByStoreId(storeId ?? "");
    return NextResponse.json(product);
}