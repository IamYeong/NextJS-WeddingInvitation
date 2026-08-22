import { createRepositories } from "./createRepositories";

const repositories = createRepositories();

export function getRepositories() {
  return repositories;
}
