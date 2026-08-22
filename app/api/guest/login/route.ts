import { NextRequest, NextResponse } from "next/server";
import { createGuestbookApi } from "@/server/api/guestbookApi";
import { toGuestResponse } from "@/server/api/guestResponse";
import { getRepositories } from "@/server/data/repositoryStore";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    provider?: string;
  };

  if (body.provider !== "anonymous") {
    return NextResponse.json(
      { message: "현재는 비회원 로그인만 직접 요청할 수 있습니다." },
      { status: 400 },
    );
  }

  const api = createGuestbookApi(getRepositories());
  const guest = await api.login({ provider: "anonymous" });
  const response = NextResponse.json({ guest: toGuestResponse(guest) });

  response.cookies.set("guest_provider", "anonymous", {
    httpOnly: true,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  response.cookies.set("guest_id", guest.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  response.cookies.delete("guest_access_token");

  return response;
}
