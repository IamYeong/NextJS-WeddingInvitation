import { Comment } from "@/server/domain/entity/Comment";

export function toCommentResponse(comment: Comment) {
  return {
    id: comment.id,
    authorId: getCommentAuthorId(comment),
    authorNickname: comment.author.nickname,
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
  };
}

function getCommentAuthorId(comment: Comment) {
  if (comment.author.isAnonymous) {
    return "anonymous";
  }

  return comment.author.loginInfo.oauthUserId ?? "";
}
