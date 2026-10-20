import { NextRequest, NextResponse } from "next/server";
import { guestbookCards } from "@/content/guestbook";
import { toCommentResponse } from "@/server/api/commentResponse";
import { getRepositories } from "@/server/data/repositoryStore";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const card = guestbookCards.find((item) => item.id === body?.cardId);

  if (!card) {
    return NextResponse.json({ message: "카드를 선택해주세요." }, { status: 400 });
  }

  try {
    const { guestRepository, commentRepository } = getRepositories();
    const author = await guestRepository.login({ provider: "anonymous" });
    const comment = await commentRepository.save({
      author,
      content: card.message,
      createdAt: new Date(),
    });

    return NextResponse.json({ comment: toCommentResponse(comment) });
  } catch {
    return NextResponse.json({ message: "카드를 저장하지 못했습니다." }, { status: 500 });
  }
}
