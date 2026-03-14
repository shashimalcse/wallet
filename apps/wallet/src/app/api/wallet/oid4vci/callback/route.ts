import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const offerUrl = new URL("/offer", request.nextUrl.origin);

  if (error) {
    offerUrl.searchParams.set("error", error);
    if (errorDescription) {
      offerUrl.searchParams.set("error_description", errorDescription);
    }
    return NextResponse.redirect(offerUrl);
  }

  if (!code || !state) {
    offerUrl.searchParams.set("error", "Invalid authorization response");
    return NextResponse.redirect(offerUrl);
  }

  offerUrl.searchParams.set("code", code);
  offerUrl.searchParams.set("state", state);

  return NextResponse.redirect(offerUrl);
}
