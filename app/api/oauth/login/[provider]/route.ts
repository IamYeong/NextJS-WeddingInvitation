import { NextRequest, NextResponse } from "next/server";
import { getRepositories } from "@/server/data/repositoryStore";
import { OAuthProvider } from "@/server/data/oauth/OAuthUserRepository";

const OAUTH_PROVIDERS = ["kakao", "naver", "google"] as const;

function isOAuthProvider(provider: string): provider is OAuthProvider {
  return OAUTH_PROVIDERS.includes(provider as OAuthProvider);
}

function createState() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export async function GET(
  request: NextRequest,
  context: RouteContext<"/api/oauth/login/[provider]">,
) {
  const { provider } = await context.params;

  if (!isOAuthProvider(provider)) {
    return NextResponse.json(
      { message: "지원하지 않는 OAuth provider입니다." },
      { status: 400 },
    );
  }

  const { oauthAuthorizationRepositories } = getRepositories();
  const oauthAuthorizationRepository =
    oauthAuthorizationRepositories[provider];
  const state = createState();
  const authorizeUrl = oauthAuthorizationRepository.createAuthorizationUrl({
    origin: request.nextUrl.origin,
    state,
  });
  const response = NextResponse.redirect(authorizeUrl);

  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    path: "/",
    maxAge: 60 * 10,
  });

  return response;
}
