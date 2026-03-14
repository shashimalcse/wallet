import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnLoginPage = req.nextUrl.pathname === "/login";
  const isAuthRoute = req.nextUrl.pathname.startsWith("/api/auth");
  const isWalletApiRoute = req.nextUrl.pathname.startsWith("/api/wallet/");
  const isOfferPage = req.nextUrl.pathname === "/offer";

  if (isAuthRoute || isWalletApiRoute || isOfferPage) return;

  if (!isLoggedIn && !isOnLoginPage) {
    return Response.redirect(new URL("/login", req.nextUrl.origin));
  }

  if (isLoggedIn && isOnLoginPage) {
    return Response.redirect(new URL("/home", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.json|icons/).*)"],
};
