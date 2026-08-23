import { AuthProvider } from "@/server/domain/entity/Guest";

export type OAuthProvider = Exclude<AuthProvider, "anonymous">;

export type OAuthTokenResponse = {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
};

export type OAuthAuthorizationRepository = {
  readonly provider: OAuthProvider;
  createAuthorizationUrl(params: {
    origin: string;
    state: string;
  }): URL;
  requestAccessToken(params: {
    origin: string;
    code: string;
  }): Promise<OAuthTokenResponse>;
};

export abstract class OAuthAuthorizationRepositoryBase
  implements OAuthAuthorizationRepository
{
  abstract readonly provider: OAuthProvider;
  protected abstract readonly authorizeUrl: string;
  protected abstract readonly tokenUrl: string;
  protected abstract getClientId(): string;

  createAuthorizationUrl({
    origin,
    state,
  }: {
    origin: string;
    state: string;
  }) {
    const url = new URL(this.authorizeUrl);

    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", this.getClientId());
    url.searchParams.set("redirect_uri", this.getRedirectUri(origin));
    url.searchParams.set("state", state);
    this.applyAuthorizationParams(url);

    return url;
  }

  async requestAccessToken({
    origin,
    code,
  }: {
    origin: string;
    code: string;
  }) {
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: this.getClientId(),
      redirect_uri: this.getRedirectUri(origin),
      code,
    });
    const clientSecret = this.getClientSecret();

    if (clientSecret) {
      body.set("client_secret", clientSecret);
    }

    this.applyTokenParams(body);

    const response = await fetch(this.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
      body,
    });

    if (!response.ok) {
      throw new Error(`OAuth 토큰 발급 실패: ${response.status}`);
    }

    return response.json() as Promise<OAuthTokenResponse>;
  }

  protected applyAuthorizationParams(url: URL) {
    void url;
  }

  protected applyTokenParams(body: URLSearchParams) {
    void body;
  }

  protected getRedirectUri(origin: string) {
    return `${origin}/api/oauth/callback/${this.provider}`;
  }

  protected getClientSecret(): string | undefined {
    return undefined;
  }

  protected requireEnv(value: string | undefined, key: string) {
    if (!value?.trim()) {
      throw new Error(`${key} 환경변수가 필요합니다.`);
    }

    return value;
  }
}
