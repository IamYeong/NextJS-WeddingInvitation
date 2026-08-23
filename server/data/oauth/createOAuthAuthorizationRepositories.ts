import { GoogleOAuthAuthorizationRepository } from "./google/GoogleOAuthAuthorizationRepository";
import { KakaoOAuthAuthorizationRepository } from "./kakao/KakaoOAuthAuthorizationRepository";
import { NaverOAuthAuthorizationRepository } from "./naver/NaverOAuthAuthorizationRepository";

export function createOAuthAuthorizationRepositories() {
  const repositories = [
    new KakaoOAuthAuthorizationRepository(),
    new NaverOAuthAuthorizationRepository(),
    new GoogleOAuthAuthorizationRepository(),
  ];

  return Object.fromEntries(
    repositories.map((repository) => [repository.provider, repository]),
  );
}
