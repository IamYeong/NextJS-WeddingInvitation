import { Guest } from "@/server/domain/entity/Guest";

export function toGuestResponse(guest: Guest) {
  return {
    id: guest.id,
    nickname: guest.nickname,
    provider: guest.loginInfo.provider,
    oauthUserId: guest.loginInfo.oauthUserId,
  };
}
