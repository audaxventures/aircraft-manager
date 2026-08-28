export { auth as proxy } from "@/auth";

export const config = {
  // "images" excludes public/images/* -- static assets (logos, backgrounds)
  // must stay reachable even when signed out, e.g. the login page's own
  // background image.
  matcher: ["/((?!api/auth|login|_next/static|_next/image|favicon.ico|images/).*)"],
};
