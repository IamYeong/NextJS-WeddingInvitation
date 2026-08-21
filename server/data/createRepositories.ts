import { CommentRepositoryImpl } from "./sheet/CommentRepositoryImpl";
import { GoogleOAuthUserRepository } from "./oauth/google/GoogleOAuthUserRepository";
import { GuestRepositoryImpl } from "./oauth/GuestRepositoryImpl";
import { KakaoOAuthUserRepository } from "./oauth/kakao/KakaoOAuthUserRepository";
import { NaverOAuthUserRepository } from "./oauth/naver/NaverOAuthUserRepository";

export function createRepositories() {
  const guestRepository = new GuestRepositoryImpl([
    new KakaoOAuthUserRepository(),
    new NaverOAuthUserRepository(),
    new GoogleOAuthUserRepository(),
  ]);
  const commentRepository = new CommentRepositoryImpl();

  return {
    guestRepository,
    commentRepository,
  };
}
