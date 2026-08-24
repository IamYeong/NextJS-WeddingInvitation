import { CommentRepository } from "@/server/domain/repository/CommentRepository";
import { CommentRepositoryImpl } from "./sheet/CommentRepositoryImpl";
import {
  getGoogleSheetsConfig,
  GoogleSheetsClient,
} from "./sheet/GoogleSheetsClient";
import { createOAuthAuthorizationRepositories } from "./oauth/createOAuthAuthorizationRepositories";
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
  const commentRepository = createCommentRepository();

  return {
    oauthAuthorizationRepositories: createOAuthAuthorizationRepositories(),
    guestRepository,
    commentRepository,
  };
}

function createCommentRepository(): CommentRepository {
  try {
    return new CommentRepositoryImpl(
      new GoogleSheetsClient(getGoogleSheetsConfig()),
    );
  } catch (error) {
    return {
      async save() {
        throw error;
      },
      async list() {
        throw error;
      },
      async listAll() {
        throw error;
      },
    };
  }
}
