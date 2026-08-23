import { Guest } from "@/server/domain/entity/Guest";
import {
  GuestLoginRequest,
  GuestRepository,
} from "@/server/domain/repository/GuestRepository";
import { ANIMAL_NICKNAMES } from "@/server/data/local/animalNicknames";
import {
  OAuthProvider,
  OAuthRepositoryBase,
  OAuthUserRepository,
} from "@/server/data/oauth/OAuthUserRepository";

export class GuestRepositoryImpl extends OAuthRepositoryBase implements GuestRepository {
  private readonly guestsById = new Map<string, Guest>();
  private readonly guestIdsByOAuth = new Map<string, string>();
  private readonly nicknameCounts = new Map<string, number>();
  private readonly oauthRepositories: Partial<Record<OAuthProvider, OAuthUserRepository<unknown>>>;

  constructor(oauthRepositories: OAuthUserRepository<unknown>[]) {
    super();
    this.oauthRepositories = Object.fromEntries(
      oauthRepositories.map((repository) => [
        repository.provider,
        repository,
      ]),
    );
  }

  async login(request: GuestLoginRequest): Promise<Guest> {
    if (request.provider === "anonymous") {
      return this.createAnonymousGuest();
    }

    const oauthUserRepository = this.oauthRepositories[request.provider];

    if (!oauthUserRepository) {
      throw new Error(`${request.provider} OAuth repository가 필요합니다.`);
    }

    const oauthUserInfo = await oauthUserRepository.findUserInfo(
      request.accessToken,
    );
    const existingGuest = await this.findByOAuthUser(
      oauthUserInfo.provider,
      oauthUserInfo.oauthUserId,
    );

    if (existingGuest) {
      return existingGuest;
    }

    const guest = new Guest({
      id: this.createId("guest"),
      nickname: this.createUniqueNickname(
        oauthUserInfo.nickname ?? `${request.provider} 사용자`,
      ),
      loginInfo: {
        provider: request.provider,
        oauthUserId: oauthUserInfo.oauthUserId,
        accessToken: request.accessToken,
      },
    });

    this.saveGuest(guest);
    this.guestIdsByOAuth.set(
      this.getOAuthKey(request.provider, oauthUserInfo.oauthUserId),
      guest.id,
    );

    return guest;
  }

  async findById(id: string): Promise<Guest | null> {
    return this.guestsById.get(id) ?? null;
  }

  async findByOAuthUser(
    provider: OAuthProvider,
    oauthUserId: string,
  ): Promise<Guest | null> {
    const guestId = this.guestIdsByOAuth.get(
      this.getOAuthKey(provider, oauthUserId),
    );

    if (!guestId) {
      return null;
    }

    return this.findById(guestId);
  }

  private createAnonymousGuest() {
    const animal =
      ANIMAL_NICKNAMES[Math.floor(Math.random() * ANIMAL_NICKNAMES.length)];
    const guest = new Guest({
      id: this.createId("guest"),
      nickname: this.createUniqueNickname(`축하하는 ${animal}`),
      loginInfo: {
        provider: "anonymous",
      },
    });

    this.saveGuest(guest);

    return guest;
  }

  private saveGuest(guest: Guest) {
    this.guestsById.set(guest.id, guest);
  }

  private createUniqueNickname(baseNickname: string) {
    const count = this.nicknameCounts.get(baseNickname) ?? 0;
    const nextCount = count + 1;

    this.nicknameCounts.set(baseNickname, nextCount);

    if (count === 0) {
      return baseNickname;
    }

    return `${baseNickname}${nextCount}`;
  }

  private getOAuthKey(provider: OAuthProvider, oauthUserId: string) {
    return `${provider}:${oauthUserId}`;
  }
}
