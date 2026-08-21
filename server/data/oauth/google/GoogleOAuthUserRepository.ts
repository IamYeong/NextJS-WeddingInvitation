import {
  OAuthUserInfo,
  OAuthUserRepository,
} from "@/server/data/oauth/OAuthUserRepository";

type GoogleUserResponse = {
  sub: string;
  name?: string;
};

export class GoogleOAuthUserRepository extends OAuthUserRepository<GoogleUserResponse> {
  readonly provider = "google";
  protected readonly userInfoUrl =
    "https://openidconnect.googleapis.com/v1/userinfo";
  protected readonly appIdEnvKey = "GOOGLE_CLIENT_ID";

  protected toOAuthUserInfo(response: GoogleUserResponse): OAuthUserInfo {
    return {
      provider: this.provider,
      oauthUserId: response.sub,
      nickname: response.name,
    };
  }
}
