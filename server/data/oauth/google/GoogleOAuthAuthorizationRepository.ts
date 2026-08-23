import { OAuthAuthorizationRepositoryBase } from "@/server/data/oauth/OAuthAuthorization";

export class GoogleOAuthAuthorizationRepository extends OAuthAuthorizationRepositoryBase {
  readonly provider = "google";
  protected readonly authorizeUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  protected readonly tokenUrl = "https://oauth2.googleapis.com/token";

  protected getClientId() {
    return this.requireEnv(process.env.GOOGLE_CLIENT_ID, "GOOGLE_CLIENT_ID");
  }

  protected getClientSecret() {
    return this.requireEnv(
      process.env.GOOGLE_CLIENT_SECRET,
      "GOOGLE_CLIENT_SECRET",
    );
  }

  protected applyAuthorizationParams(url: URL) {
    url.searchParams.set("scope", "openid profile");
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("prompt", "select_account");
  }
}
