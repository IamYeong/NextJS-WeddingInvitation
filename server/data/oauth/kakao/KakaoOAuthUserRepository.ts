import {
  OAuthUserInfo,
  OAuthUserRepository,
} from "@/server/data/oauth/OAuthUserRepository";

type KakaoUserResponse = {
  id: number;
  properties?: {
    nickname?: string;
  };
  kakao_account?: {
    profile?: {
      nickname?: string;
    };
  };
};

export class KakaoOAuthUserRepository extends OAuthUserRepository<KakaoUserResponse> {
  readonly provider = "kakao";
  protected readonly userInfoUrl = "https://kapi.kakao.com/v2/user/me";
  protected readonly appIdEnvKey = "KAKAO_APP_ID";

  protected toOAuthUserInfo(response: KakaoUserResponse): OAuthUserInfo {
    return {
      provider: this.provider,
      oauthUserId: String(response.id),
      nickname:
        response.kakao_account?.profile?.nickname ??
        response.properties?.nickname,
    };
  }
}
