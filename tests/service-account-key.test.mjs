import { generateKeyPairSync, createPrivateKey } from "node:crypto";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";

const compiled = ts.transpileModule(readFileSync("server/data/sheet/parseServiceAccountKey.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const exported = {};
new Function("exports", compiled)(exported);
const { parseServiceAccountKey } = exported;
const key = { client_email: "example@test.invalid", private_key: "-----BEGIN PRIVATE KEY-----\nexample\n-----END PRIVATE KEY-----\n", token_uri: "https://oauth2.googleapis.com/token" };
const json = JSON.stringify(key);

test("preserves standard JSON and pretty-printed JSON", () => {
  assert.deepEqual(parseServiceAccountKey(json), key);
  assert.deepEqual(parseServiceAccountKey(JSON.stringify(key, null, 2)), key);
});

test("accepts env quote wrappers and JSON-string encoding", () => {
  for (const value of [`'${json}'`, `"${json}"`, JSON.stringify(json), json.replaceAll('"', '\\"')]) {
    assert.deepEqual(parseServiceAccountKey(value), key);
  }
});

test("normalizes literal private-key newlines expanded by dotenv", () => {
  assert.deepEqual(parseServiceAccountKey(json.replaceAll('\\n', '\n')), key);
  assert.deepEqual(parseServiceAccountKey(json.replaceAll('\\n', '\\' + '\n')), key);
});

test("preserves literal backslashes that env loading left as invalid JSON escapes", () => {
  assert.equal(parseServiceAccountKey('{"private_key":"example' + '\\' + '-key"}').private_key, "example" + "\\" + "-key");
});

test("rejects malformed documents and types without exposing input", () => {
  for (const value of ['{"private_key":"SECRET",', 'null', '[]', '42', '{"private_key":42}']) {
    assert.throws(() => parseServiceAccountKey(value), {
      message: "GOOLGE_SERVICE_ACCOUNT_KEY_JSON 형식을 확인해주세요.",
    });
  }
});

test("normalizes env escapes into the same cryptographic private key", () => {
  const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const pem = privateKey.export({ type: "pkcs8", format: "pem" });
  for (const value of [pem, pem.replaceAll("\n", "\\n"), pem.replaceAll("\n", "\\\\n"), pem.replaceAll("\n", "\\" + "\n"), pem.replaceAll("/", "\\/")]) {
    const normalized = exported.normalizeServiceAccountPrivateKey(value);
    assert.deepEqual(createPrivateKey(normalized).export({ type: "pkcs8", format: "der" }), privateKey.export({ type: "pkcs8", format: "der" }));
  }
});
