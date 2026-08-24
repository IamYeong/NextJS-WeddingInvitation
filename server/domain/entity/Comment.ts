import { Guest } from "./Guest";

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
    this.id = props.id;
    this.author = props.author;
    this.createdAt = props.createdAt;
    this.content = props.content;
  }
}
