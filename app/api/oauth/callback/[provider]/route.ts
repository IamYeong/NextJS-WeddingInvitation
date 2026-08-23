import { NextRequest, NextResponse } from "next/server";
import { getRepositories } from "@/server/data/repositoryStore";
import { OAuthProvider } from "@/server/data/oauth/OAuthUserRepository";

const OAUTH_PROVIDERS = ["kakao", "naver", "google"] as const;

function isOAuthProvider(provider: string): provider is OAuthProvider {
  return OAUTH_PROVIDERS.includes(provider as OAuthProvider);
}

function setGuestCookies({
  request,
  response,
  provider,
  accessToken,
  guestId,
}: {
  request: NextRequest;
  response: NextResponse;
  provider: OAuthProvider;
  accessToken: string;
  guestId: string;
}) {
  const secure = request.nextUrl.protocol === "https:";

  response.cookies.set("guest_provider", provider, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  response.cookies.set("guest_access_token", accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  response.cookies.set("guest_id", guestId, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  response.cookies.delete("oauth_state");
}

export async function GET(
  request: NextRequest,
  context: RouteContext<"/api/oauth/callback/[provider]">,
) {
  const { provider } = await context.params;
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");
  const storedState = request.cookies.get("oauth_state")?.value;
  const redirectUrl = new URL("/", request.nextUrl.origin);

  if (!isOAuthProvider(provider)) {
    return NextResponse.json(
      { message: "지원하지 않는 OAuth provider입니다." },
      { status: 400 },
    );
  }

  if (error) {
    redirectUrl.searchParams.set("login", "cancelled");
    return NextResponse.redirect(redirectUrl);
  }

  if (!code || !state || state !== storedState) {
    redirectUrl.searchParams.set("login", "failed");
    return NextResponse.redirect(redirectUrl);
  }

  const {
    oauthAuthorizationRepositories,
    guestRepository,
  } = getRepositories();
  const token = await oauthAuthorizationRepositories[
    provider
  ].requestAccessToken({
    origin: request.nextUrl.origin,
    code,
  });
  const guest = await guestRepository.login({
    provider,
    accessToken: token.access_token,
  });
  const response = NextResponse.redirect(redirectUrl);

  setGuestCookies({
    request,
    response,
    provider,
    accessToken: token.access_token,
    guestId: guest.id,
  });

  return response;
}
