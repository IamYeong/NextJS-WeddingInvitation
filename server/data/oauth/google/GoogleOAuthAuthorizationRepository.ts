import { OAuthAuthorizationRepositoryBase } from "@/server/data/oauth/OAuthAuthorization";

export class GoogleOAuthAuthorizationRepository extends OAuthAuthorizationRepositoryBase {
  readonly provider = "google";
  protected readonly authorizeUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  protected readonly tokenUrl = "https://oauth2.googleapis.com/token";
  protected readonly clientIdEnvKey = "GOOGLE_CLIENT_ID";
  protected readonly clientSecretEnvKey = "GOOGLE_CLIENT_SECRET";
  protected readonly clientSecretRequired = true;

  protected applyAuthorizationParams(url: URL) {
    url.searchParams.set("scope", "openid profile");
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("prompt", "select_account");
  }
}
