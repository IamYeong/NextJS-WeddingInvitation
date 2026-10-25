import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { getRepositories } from "@/server/data/repositoryStore";
import { getCoupleNames } from "@/content/couple";

// One read per request for both metadata and page; never send bank details
// from this server-only read to the home page client component.
export const getWeddingCouple = cache(async () => {
  await connection();
  try {
    return getCoupleNames(await getRepositories().familyAccountRepository.list());
  } catch {
    // Keep the invitation usable during a Sheets outage without invented names.
    return getCoupleNames([]);
  }
});
