import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = ["/login", "/signup", "/", "/about"];

export function middleware(request: NextRequest) {
  // Check if the requested path is a public route
  const isPublicRoute = publicRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Get the token from cookies
  const token = request.cookies.get("jwt");

  // Allow access to public routes without authentication
  if (isPublicRoute) {
    // If user is already logged in and tries to access login/signup pages, redirect to profile
    if (
      token &&
      (request.nextUrl.pathname === "/login" ||
        request.nextUrl.pathname === "/signup")
    ) {
      return NextResponse.redirect(new URL("/profile", request.url));
    }
    return NextResponse.next();
  }

  // Redirect to login if no token is present for protected routes
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // User is authenticated, allow access to protected routes
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
