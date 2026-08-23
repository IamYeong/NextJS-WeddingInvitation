export type AuthProvider = "kakao" | "google" | "naver" | "anonymous";

export type LoginInfo = {
  provider: AuthProvider;
  oauthUserId?: string;
  accessToken?: string;
};

export type GuestProps = {
  id: string;
  nickname: string;
  loginInfo: LoginInfo;
};

export class Guest {
  readonly id: string;
  readonly nickname: string;
  readonly loginInfo: LoginInfo;

  constructor(props: GuestProps) {
    this.id = props.id;
    this.nickname = props.nickname;
    this.loginInfo = props.loginInfo;
  }

  get isAnonymous() {
    return this.loginInfo.provider === "anonymous";
  }
}
