import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Edge runtime: keep this cheap — just "is there a valid session token?"
// The real workspace-role check happens in (dashboard)/[workspaceId]/layout.tsx
// (Node runtime), because standard Prisma + pg doesn't run on the Edge.
export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Protects everything except the public marketing/auth pages, API routes,
// and Next.js internals/static assets.
export const config = {
  matcher: ["/((?!login|register|api|_next/static|_next/image|favicon.ico|$).*)"],
};
