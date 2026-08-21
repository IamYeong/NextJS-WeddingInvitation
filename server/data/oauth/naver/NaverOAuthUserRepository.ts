import {
  OAuthUserInfo,
  OAuthUserRepository,
} from "@/server/data/oauth/OAuthUserRepository";

type NaverUserResponse = {
  response?: {
    id?: string;
    nickname?: string;
    name?: string;
  };
};

export class NaverOAuthUserRepository extends OAuthUserRepository<NaverUserResponse> {
  readonly provider = "naver";
  protected readonly userInfoUrl = "https://openapi.naver.com/v1/nid/me";
  protected readonly appIdEnvKey = "NAVER_CLIENT_ID";

  protected toOAuthUserInfo(response: NaverUserResponse): OAuthUserInfo {
    const oauthUserId = response.response?.id;

    if (!oauthUserId) {
      throw new Error("네이버 유저 ID를 확인하지 못했습니다.");
    }

    return {
      provider: this.provider,
      oauthUserId,
      nickname: response.response?.nickname ?? response.response?.name,
    };
  }
}
