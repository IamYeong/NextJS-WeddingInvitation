import type { FamilyAccount } from "../entity/FamilyAccount";

export interface FamilyAccountRepository {
  list(): Promise<FamilyAccount[]>;
}
