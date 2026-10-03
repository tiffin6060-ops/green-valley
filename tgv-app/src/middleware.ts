import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { COOKIE, verifySession } from "@/lib/session-token";

const intl = createIntlMiddleware(routing);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Investor portal + admin: unchanged login/role protection.
  if (pathname.startsWith("/portal") || pathname.startsWith("/admin")) {
    const session = await verifySession(req.cookies.get(COOKIE)?.value);
    const deny = () => NextResponse.redirect(new URL("/login", req.url));
    if (!session) return deny();
    if (pathname.startsWith("/admin") && session.role === "investor") return NextResponse.redirect(new URL("/portal", req.url));
    if (pathname.startsWith("/portal") && session.role !== "investor") return NextResponse.redirect(new URL("/admin", req.url));

    const headers = new Headers(req.headers);
    headers.set("x-pathname", pathname);
    return NextResponse.next({ request: { headers } });
  }

  // Public website (English at "/", Bangla at "/bn").
  return intl(req);
}

export const config = {
  matcher: [
    "/portal/:path*",
    "/admin/:path*",
    // Public site: skip the app's own routes, API, Next internals and any file with an extension.
    "/((?!api|_next|_vercel|login|setup|files|stream|portal|admin|.*\\..*).*)",
  ],
};
