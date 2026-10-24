type ServiceAccountKey = {
  client_email?: string;
  private_key?: string;
  token_uri?: string;
};

// dotenv may expand \n in quoted values into actual newlines inside JSON strings.
function escapeStringControls(value: string) {
  let inString = false;
  let escaped = false;
  let result = "";
  for (let index = 0; index < value.length; index++) {
    const char = value[index];
    const next = value[index + 1];
    if (inString && !escaped && char === "\\" && next && !'"\\/bfnrtu\n\r\t'.includes(next)) {
      result += "\\\\";
      continue;
    }
    if (inString && (char === "\n" || char === "\r" || char === "\t")) {
      if (escaped) result = result.slice(0, -1);
      escaped = false;
      result += JSON.stringify(char).slice(1, -1);
      continue;
    }
    result += char;
    if (escaped) escaped = false;
    else if (inString && char === "\\") escaped = true;
    else if (char === '"') inString = !inString;
  }
  return result;
}

export function parseServiceAccountKey(raw: string): ServiceAccountKey {
  let value: unknown = raw.trim();
  try {
    // Accept ordinary JSON, an outer env quote pair, and JSON encoded as a string.
    for (let depth = 0; depth < 3 && typeof value === "string"; depth++) {
      const text = value.trim();
      try {
        value = JSON.parse(escapeStringControls(text));
      } catch {
        const quote = text[0];
        if ((quote === "'" || quote === '"') && text.endsWith(quote)) {
          value = text.slice(1, -1);
        } else if (text.startsWith('{\\"')) {
          value = JSON.parse(`"${escapeStringControls(text)}"`);
        } else {
          throw new Error();
        }
      }
    }
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
    const key = value as Record<string, unknown>;
    for (const field of ["client_email", "private_key", "token_uri"]) {
      if (key[field] !== undefined && typeof key[field] !== "string") throw new Error();
    }
    return {
      client_email: key.client_email as string | undefined,
      private_key: key.private_key as string | undefined,
      token_uri: key.token_uri as string | undefined,
    };
  } catch {
    // Never include the original value or JSON.parse's credential-bearing message.
    throw new Error("GOOLGE_SERVICE_ACCOUNT_KEY_JSON 형식을 확인해주세요.");
  }
}

export function normalizeServiceAccountPrivateKey(privateKey: string) {
  // Backslashes are env/JSON escapes, never part of a PEM base64 payload.
  return privateKey
    .replace(/\\+r\\+n/g, "\n")
    .replace(/\\+n/g, "\n")
    .replace(/\\+\r?\n/g, "\n")
    .replace(/\\/g, "")
    .trim();
}
