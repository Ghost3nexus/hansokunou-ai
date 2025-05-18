import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request });
  
  const publicPaths = ["/login", "/api/auth", "/pricing"];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth')) {
    if (!token) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      });
    }
  }
  
  if (!token && !isPublicPath) {
    const url = new URL(`/login`, request.url);
    url.searchParams.set("callbackUrl", encodeURI(pathname));
    return NextResponse.redirect(url);
  }
  
  if (token && !isPublicPath) {
    const subscription = token.subscription as any;
    const protectedRoutes = ["/analyze", "/dashboard", "/settings"];
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    
    if (isProtectedRoute && (!subscription || subscription.status === 'lite')) {
      return NextResponse.redirect(new URL("/pricing", request.url));
    }
  }
  
  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
