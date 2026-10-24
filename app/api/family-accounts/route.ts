import { NextResponse } from "next/server";
import { getRepositories } from "@/server/data/repositoryStore";

export async function GET() {
  const headers = { "Cache-Control": "no-store" };
  try {
    const accounts = await getRepositories().familyAccountRepository.list();
    return NextResponse.json({ accounts }, { headers });
  } catch {
    return NextResponse.json(
      { message: "계좌 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요." },
      { status: 503, headers },
    );
  }
}
