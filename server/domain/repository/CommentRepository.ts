import { Comment } from "../entity/Comment";
import { Guest } from "../entity/Guest";
import { PageResult, PaginationRequest } from "./Pagination";

export type SaveCommentRequest = {
  author: Guest;
  content: string;
  createdAt: Date;
};

export interface CommentRepository {
  save(request: SaveCommentRequest): Promise<Comment>;
  list(request: PaginationRequest): Promise<PageResult<Comment>>;
  listAll(): Promise<Comment[]>;
}
