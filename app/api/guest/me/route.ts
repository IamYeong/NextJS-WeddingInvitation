import { NextRequest, NextResponse } from "next/server";
import { createGuestbookApi } from "@/server/api/guestbookApi";
import { toGuestResponse } from "@/server/api/guestResponse";
import { getRepositories } from "@/server/data/repositoryStore";

export async function GET(request: NextRequest) {
  const guestId = request.cookies.get("guest_id")?.value;

  if (!guestId) {
    return NextResponse.json({ guest: null });
  }

  const api = createGuestbookApi(getRepositories());
  const guest = await api.getGuest(guestId);

  return NextResponse.json({
    guest: guest ? toGuestResponse(guest) : null,
  });
}
