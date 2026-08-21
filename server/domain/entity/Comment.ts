import { Guest } from "./Guest";

export const ANONYMOUS_COMMENT_CONTENT = "축하합니다♥!";

export type CommentProps = {
  id: string;
  author: Guest;
  createdAt: Date;
  content: string;
};

export class Comment {
  readonly id: string;
  readonly author: Guest;
  readonly createdAt: Date;
  readonly content: string;

  constructor(props: CommentProps) {
    if (props.author.isAnonymous && props.content !== ANONYMOUS_COMMENT_CONTENT) {
      throw new Error("비회원은 기본 축하 메시지만 작성할 수 있습니다.");
    }

    this.id = props.id;
    this.author = props.author;
    this.createdAt = props.createdAt;
    this.content = props.content;
  }
}
