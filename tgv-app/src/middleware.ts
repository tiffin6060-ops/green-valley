import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, verifySession } from "@/lib/session-token";

export async function middleware(req: NextRequest) {
  const session = await verifySession(req.cookies.get(COOKIE)?.value);
  const { pathname } = req.nextUrl;
  const deny = () => NextResponse.redirect(new URL("/login", req.url));

  if (!session) return deny();
  if (pathname.startsWith("/admin") && session.role === "investor") return NextResponse.redirect(new URL("/portal", req.url));
  if (pathname.startsWith("/portal") && session.role !== "investor") return NextResponse.redirect(new URL("/admin", req.url));

  const headers = new Headers(req.headers);
  headers.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = { matcher: ["/portal/:path*", "/admin/:path*"] };
