import type { FamilyAccount, FamilyRole } from "@/server/domain/entity/FamilyAccount";
import type { FamilyAccountRepository } from "@/server/domain/repository/FamilyAccountRepository";
import type { GoogleSheetsClient } from "./GoogleSheetsClient";

// Fixed row positions in admin!B1:C6; blank rows must never shift roles.
const roles: FamilyRole[] = [
  "brideMother", "brideFather", "groomMother", "groomFather", "bride", "groom",
];

export class FamilyAccountRepositoryImpl implements FamilyAccountRepository {
  constructor(private readonly sheetsClient: Pick<GoogleSheetsClient, "getValues">) {}

  async list(): Promise<FamilyAccount[]> {
    const rows = await this.sheetsClient.getValues("B1:C6");
    return roles.flatMap((role, index) => {
      const name = rows[index]?.[0]?.trim() ?? "";
      const accountNumber = rows[index]?.[1]?.trim() ?? "";
      return name ? [{ role, name, accountNumber }] : [];
    });
  }
}
