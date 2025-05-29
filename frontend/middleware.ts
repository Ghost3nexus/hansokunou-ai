import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  
  const protectedPaths = ['/dashboard', '/analyze', '/settings'];
  const isProtected = protectedPaths.some((p) => request.nextUrl.pathname.startsWith(p));
  
  if (request.nextUrl.pathname.startsWith('/api/') && !request.nextUrl.pathname.startsWith('/api/auth')) {
    if (!token) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      });
    }
  }
  
  if (!token && isProtected) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  if (token && isProtected) {
    const subscription = token.subscription as any;
    if (!subscription || subscription.status === 'lite') {
      return NextResponse.redirect(new URL("/pricing", request.url));
    }
  }
  
  if (token && request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard(.*)', '/analyze(.*)', '/settings(.*)', '/api/((?!auth).*)'],
};
