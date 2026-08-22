import { OAuthAuthorizationRepositoryBase } from "@/server/data/oauth/OAuthAuthorization";

export class NaverOAuthAuthorizationRepository extends OAuthAuthorizationRepositoryBase {
  readonly provider = "naver";
  protected readonly authorizeUrl = "https://nid.naver.com/oauth2.0/authorize";
  protected readonly tokenUrl = "https://nid.naver.com/oauth2.0/token";
  protected readonly clientIdEnvKey = "NAVER_CLIENT_ID";
  protected readonly clientSecretEnvKey = "NAVER_CLIENT_SECRET";
  protected readonly clientSecretRequired = true;
}
