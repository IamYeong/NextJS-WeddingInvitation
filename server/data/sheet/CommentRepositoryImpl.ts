import { Comment } from "@/server/domain/entity/Comment";
import {
  CommentRepository,
  SaveCommentRequest,
} from "@/server/domain/repository/CommentRepository";
import {
  normalizePagination,
  PageResult,
  PaginationRequest,
} from "@/server/domain/repository/Pagination";

export class CommentRepositoryImpl implements CommentRepository {
  private readonly comments: Comment[] = [];

  async save(request: SaveCommentRequest): Promise<Comment> {
    const comment = new Comment({
      id: this.createCommentId(),
      author: request.author,
      createdAt: request.createdAt,
      content: request.content,
    });

    this.comments.unshift(comment);

    return comment;
  }

  async list(request: PaginationRequest): Promise<PageResult<Comment>> {
    const { page, pageSize } = normalizePagination(request);
    const startIndex = (page - 1) * pageSize;
    const totalItems = this.comments.length;
    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      items: this.comments.slice(startIndex, startIndex + pageSize),
      page,
      pageSize,
      totalItems,
      totalPages,
    };
  }

  private createCommentId() {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return `comment_${crypto.randomUUID()}`;
    }

    return `comment_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }
}
