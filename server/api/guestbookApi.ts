import {
  ANONYMOUS_COMMENT_CONTENT,
} from "@/server/domain/entity/Comment";
import { CommentRepository } from "@/server/domain/repository/CommentRepository";
import {
  GuestLoginRequest,
  GuestRepository,
} from "@/server/domain/repository/GuestRepository";
import { PaginationRequest } from "@/server/domain/repository/Pagination";

export type GuestbookApiDependencies = {
  guestRepository: GuestRepository;
  commentRepository: CommentRepository;
};

export type CreateCommentRequest = {
  guestId: string;
  content?: string;
};

export function createGuestbookApi({
  guestRepository,
  commentRepository,
}: GuestbookApiDependencies) {
  return {
    async login(request: GuestLoginRequest) {
      return guestRepository.login(request);
    },

    async getGuest(guestId: string) {
      return guestRepository.findById(guestId);
    },

    async saveComment(request: CreateCommentRequest) {
      const author = await guestRepository.findById(request.guestId);

      if (!author) {
        throw new Error("댓글 작성자를 찾을 수 없습니다.");
      }

      const content = author.isAnonymous
        ? ANONYMOUS_COMMENT_CONTENT
        : request.content?.trim();

      if (!content) {
        throw new Error("댓글 내용이 필요합니다.");
      }

      return commentRepository.save({
        author,
        createdAt: new Date(),
        content,
      });
    },

    async listComments(request: PaginationRequest) {
      return commentRepository.list(request);
    },
  };
}
