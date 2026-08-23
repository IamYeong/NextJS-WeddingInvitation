import { AuthProvider } from "@/server/domain/entity/Guest";

export type OAuthProvider = Exclude<AuthProvider, "anonymous">;

export type OAuthUserInfo = {
  provider: OAuthProvider;
  oauthUserId: string;
  nickname?: string;
};

export abstract class OAuthRepositoryBase {
  protected createId(prefix: string) {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return `${prefix}_${crypto.randomUUID()}`;
    }

    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }
}

export abstract class OAuthUserRepository<
  TUserInfoResponse,
> extends OAuthRepositoryBase {
  abstract readonly provider: OAuthProvider;
  protected abstract readonly userInfoUrl: string;
  protected abstract validateConfig(): void;

  async findUserInfo(accessToken: string): Promise<OAuthUserInfo> {
    if (!accessToken.trim()) {
      throw new Error("액세스 토큰이 필요합니다.");
    }

    this.validateConfig();

    const response = await fetch(this.userInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`OAuth 유저 정보 조회 실패: ${response.status}`);
    }

    return this.toOAuthUserInfo(
      (await response.json()) as TUserInfoResponse,
    );
  }

  protected abstract toOAuthUserInfo(
    response: TUserInfoResponse,
  ): OAuthUserInfo;

  protected requireEnv(value: string | undefined, key: string) {
    if (!value?.trim()) {
      throw new Error(`${key} 환경변수가 필요합니다.`);
    }

    return value;
  }
}
