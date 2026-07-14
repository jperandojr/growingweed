import { NextRequest, NextResponse } from "next/server";
import { adminToken, ADMIN_COOKIE } from "@/lib/admin-auth";

// Guards the admin dashboard and its API. Everything else is untouched.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    return NextResponse.next();
  }
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (token && token === (await adminToken())) {
    return NextResponse.next();
  }
  if (pathname.startsWith("/api/")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  return NextResponse.redirect(new URL("/admin/login", req.url));
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
