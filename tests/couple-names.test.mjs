import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";

const compiled = ts.transpileModule(readFileSync("content/couple.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const exports = {};
new Function("exports", compiled)(exports);
const { getCoupleNames, formatCoupleNames } = exports;

test("uses groom and bride roles, excludes parents, and splits three-character names", () => {
  const couple = getCoupleNames([
    { role: "groomMother", name: "박어머" },
    { role: "bride", name: " 이서연 " },
    { role: "groom", name: "김도윤" },
  ]);
  assert.deepEqual(couple.groom, { fullName: "김도윤", familyName: "김", givenName: "도윤" });
  assert.deepEqual(couple.bride, { fullName: "이서연", familyName: "이", givenName: "서연" });
  assert.equal(formatCoupleNames(couple, "givenName"), "도윤 & 서연");
  assert.equal(formatCoupleNames(couple, "fullName"), "김도윤 & 이서연");
});

test("missing names retain role labels without inventing a couple", () => {
  const couple = getCoupleNames([{ role: "brideMother", name: "김어머" }]);
  assert.equal(couple.bride.fullName, "");
  assert.equal(couple.groom.givenName, "");
  assert.equal(formatCoupleNames(couple, "givenName"), "신랑 & 신부");
});
