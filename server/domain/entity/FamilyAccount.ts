export type FamilyRole =
  | "brideMother"
  | "brideFather"
  | "groomMother"
  | "groomFather"
  | "bride"
  | "groom";

export type FamilyAccount = {
  role: FamilyRole;
  name: string;
  accountNumber: string;
};
