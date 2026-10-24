import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";

const source = readFileSync("server/data/sheet/FamilyAccountRepositoryImpl.ts", "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const moduleExports = {};
new Function("exports", compiled)(moduleExports);
const { FamilyAccountRepositoryImpl } = moduleExports;

test("reads exactly B1:C6 and maps the six fixed roles in sheet order", async () => {
  const repository = new FamilyAccountRepositoryImpl({
    async getValues(range) {
      assert.equal(range, "B1:C6");
      return Array.from({ length: 6 }, (_, i) => [` 이름${i} `, ` 00${i}-123 `]);
    },
  });
  const accounts = await repository.list();
  assert.deepEqual(accounts.map(({ role }) => role), [
    "brideMother", "brideFather", "groomMother", "groomFather", "bride", "groom",
  ]);
  assert.equal(accounts[0].name, "이름0");
  assert.equal(accounts[0].accountNumber, "000-123");
});

test("blank rows do not shift roles; missing accounts remain unavailable", async () => {
  const repository = new FamilyAccountRepositoryImpl({
    async getValues() { return [[], ["아버님"], [], [], ["신부", "0123"]]; },
  });
  assert.deepEqual(await repository.list(), [
    { role: "brideFather", name: "아버님", accountNumber: "" },
    { role: "bride", name: "신부", accountNumber: "0123" },
  ]);
});

test("empty sheets and upstream failures are handled without fabricated accounts", async () => {
  assert.deepEqual(await new FamilyAccountRepositoryImpl({ async getValues() { return []; } }).list(), []);
  await assert.rejects(new FamilyAccountRepositoryImpl({ async getValues() { throw new Error("unavailable"); } }).list(), /unavailable/);
});
