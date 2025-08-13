import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  PROTECTED_API_ROUTES,
  PROTECTED_ROUTES,
} from "./constants/protect-routes";
import { clerkMiddleware } from '@clerk/nextjs/server';

const isProtectedRoute = (pathname: string, protectedPaths: string[]) => {
  return protectedPaths.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPageRouteProtected = isProtectedRoute(pathname, PROTECTED_ROUTES);
  const isApiRouteProtected = isProtectedRoute(pathname, PROTECTED_API_ROUTES);

  if (isPageRouteProtected || isApiRouteProtected) {
    const token = await getToken({ req });

    if (!token) {
      if (pathname.startsWith("/api")) {
        return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      } else {
        const loginUrl = new URL("/auth/signin", req.url);
        loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  return NextResponse.next();
}

export default clerkMiddleware();

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    "/profile/:path*",
    "/orders/:path*",
    "/admin/:path*",
    "/api/profile/:path*",
    "/api/cart/:path*",
    "/api/uploadthing/:path*",
  ],
};



