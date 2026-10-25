import type { FamilyAccount } from "@/server/domain/entity/FamilyAccount";

export type PersonName = { fullName: string; familyName: string; givenName: string };
export type CoupleNames = { groom: PersonName; bride: PersonName };

export function getCoupleNames(rows: readonly Pick<FamilyAccount, "role" | "name">[]): CoupleNames {
  const person = (role: "groom" | "bride"): PersonName => {
    const fullName = rows.find(row => row.role === role)?.name.trim() ?? "";
    const [familyName = "", ...given] = Array.from(fullName);
    return { fullName, familyName, givenName: given.join("") };
  };
  return { groom: person("groom"), bride: person("bride") };
}

export function formatCoupleNames(couple: CoupleNames, form: "fullName" | "givenName") {
  return `${couple.groom[form] || "신랑"} & ${couple.bride[form] || "신부"}`;
}
