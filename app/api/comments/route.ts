import { NextRequest, NextResponse } from "next/server";
import { toCommentResponse } from "@/server/api/commentResponse";
import { createGuestbookApi } from "@/server/api/guestbookApi";
import { getRepositories } from "@/server/data/repositoryStore";

export async function GET() {
  try {
    const api = createGuestbookApi(getRepositories());
    const comments = await api.listAllComments();

    return NextResponse.json({
      comments: comments.map(toCommentResponse),
    });
  } catch (error) {
    return NextResponse.json(
      { message: getErrorMessage(error) },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const guestId = request.cookies.get("guest_id")?.value;

  if (!guestId) {
    return NextResponse.json(
      { message: "로그인이 필요합니다." },
      { status: 401 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    content?: string;
  };

  try {
    const api = createGuestbookApi(getRepositories());
    const comment = await api.saveComment({
      guestId,
      content: body.content,
    });

    return NextResponse.json({ comment: toCommentResponse(comment) });
  } catch (error) {
    return NextResponse.json(
      { message: getErrorMessage(error) },
      { status: 400 },
    );
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "댓글 요청에 실패했습니다.";
}
