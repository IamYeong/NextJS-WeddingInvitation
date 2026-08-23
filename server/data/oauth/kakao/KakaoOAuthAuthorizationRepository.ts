import { OAuthAuthorizationRepositoryBase } from "@/server/data/oauth/OAuthAuthorization";

export class KakaoOAuthAuthorizationRepository extends OAuthAuthorizationRepositoryBase {
  readonly provider = "kakao";
  protected readonly authorizeUrl = "https://kauth.kakao.com/oauth/authorize";
  protected readonly tokenUrl = "https://kauth.kakao.com/oauth/token";

  protected getClientId() {
    return this.requireEnv(process.env.KAKAO_APP_ID, "KAKAO_APP_ID");
  }

  protected getClientSecret() {
    return process.env.KAKAO_CLIENT_SECRET;
  }
}
