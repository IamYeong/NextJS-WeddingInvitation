import { AuthProvider, Guest } from "../entity/Guest";

export type AnonymousLoginRequest = {
  provider: "anonymous";
};

export type OAuthLoginRequest = {
  provider: Exclude<AuthProvider, "anonymous">;
  accessToken: string;
};

export type GuestLoginRequest = AnonymousLoginRequest | OAuthLoginRequest;

export interface GuestRepository {
  login(request: GuestLoginRequest): Promise<Guest>;
  findById(id: string): Promise<Guest | null>;
  findByOAuthUser(
    provider: Exclude<AuthProvider, "anonymous">,
    oauthUserId: string,
  ): Promise<Guest | null>;
}
