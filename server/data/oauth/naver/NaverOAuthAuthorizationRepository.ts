import { OAuthAuthorizationRepositoryBase } from "@/server/data/oauth/OAuthAuthorization";

export class NaverOAuthAuthorizationRepository extends OAuthAuthorizationRepositoryBase {
  readonly provider = "naver";
  protected readonly authorizeUrl = "https://nid.naver.com/oauth2.0/authorize";
  protected readonly tokenUrl = "https://nid.naver.com/oauth2.0/token";

  protected getClientId() {
    return this.requireEnv(process.env.NAVER_CLIENT_ID, "NAVER_CLIENT_ID");
  }

  protected getClientSecret() {
    return this.requireEnv(
      process.env.NAVER_CLIENT_SECRET,
      "NAVER_CLIENT_SECRET",
    );
  }
}
