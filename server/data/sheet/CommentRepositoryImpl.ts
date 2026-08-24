import { Comment } from "@/server/domain/entity/Comment";
import { Guest } from "@/server/domain/entity/Guest";
import {
  CommentRepository,
  SaveCommentRequest,
} from "@/server/domain/repository/CommentRepository";
import {
  normalizePagination,
  PageResult,
  PaginationRequest,
} from "@/server/domain/repository/Pagination";
import { GoogleSheetsClient } from "./GoogleSheetsClient";

const COMMENT_HEADER = ["guestId", "nickname", "content", "createdAt"];

export class CommentRepositoryImpl implements CommentRepository {
  constructor(private readonly sheetsClient: GoogleSheetsClient) {}

  async save(request: SaveCommentRequest): Promise<Comment> {
    const comment = new Comment({
      id: this.createCommentId(),
      author: request.author,
      createdAt: request.createdAt,
      content: request.content,
    });

    await this.ensureHeader();
    await this.sheetsClient.appendValues("A:D", [
      [
        comment.author.id,
        comment.author.nickname,
        comment.content,
        comment.createdAt.toISOString(),
      ],
    ]);

    return comment;
  }

  async list(request: PaginationRequest): Promise<PageResult<Comment>> {
    const { page, pageSize } = normalizePagination(request);
    const comments = await this.listAll();
    const startIndex = (page - 1) * pageSize;
    const totalItems = comments.length;
    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      items: comments.slice(startIndex, startIndex + pageSize),
      page,
      pageSize,
      totalItems,
      totalPages,
    };
  }

  async listAll(): Promise<Comment[]> {
    await this.ensureHeader();

    const rows = await this.sheetsClient.getValues("A:D");

    return rows
      .slice(1)
      .map((row, index) => this.toComment(row, index))
      .filter((comment): comment is Comment => Boolean(comment))
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
  }

  private async ensureHeader() {
    const rows = await this.sheetsClient.getValues("A1:D1");
    const header = rows[0] ?? [];
    const hasHeader = COMMENT_HEADER.every(
      (value, index) => header[index] === value,
    );

    if (!hasHeader) {
      await this.sheetsClient.updateValues("A1:D1", [COMMENT_HEADER]);
    }
  }

  private toComment(row: string[], index: number) {
    const [guestId, nickname, content, createdAt] = row;

    if (!guestId || !nickname || !content || !createdAt) {
      return null;
    }

    return new Comment({
      id: `comment_${createdAt}_${guestId}_${index}`,
      author: new Guest({
        id: guestId,
        nickname,
        loginInfo: {
          provider: "anonymous",
        },
      }),
      createdAt: new Date(createdAt),
      content,
    });
  }

  private createCommentId() {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return `comment_${crypto.randomUUID()}`;
    }

    return `comment_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }
}
