import { OAuthAuthorizationRepositoryBase } from "@/server/data/oauth/OAuthAuthorization";

export class KakaoOAuthAuthorizationRepository extends OAuthAuthorizationRepositoryBase {
  readonly provider = "kakao";
  protected readonly authorizeUrl = "https://kauth.kakao.com/oauth/authorize";
  protected readonly tokenUrl = "https://kauth.kakao.com/oauth/token";
  protected readonly clientIdEnvKey = "KAKAO_APP_ID";
  protected readonly clientSecretEnvKey = "KAKAO_CLIENT_SECRET";
}
