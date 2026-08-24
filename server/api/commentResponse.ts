import { Comment } from "@/server/domain/entity/Comment";

export function toCommentResponse(comment: Comment) {
  return {
    id: comment.id,
    authorId: comment.author.id,
    authorNickname: comment.author.nickname,
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
  };
}
