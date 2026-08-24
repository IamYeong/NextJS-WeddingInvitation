import { createSign } from "node:crypto";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";

type GoogleTokenResponse = {
  access_token: string;
  expires_in: number;
};

type SheetValuesResponse = {
  values?: string[][];
};

export type GoogleSheetsConfig = {
  spreadsheetId: string;
  sheetName: string;
  clientEmail: string;
  privateKey: string;
  tokenUri: string;
};

type GoogleServiceAccountKey = {
  client_email?: string;
  private_key?: string;
  token_uri?: string;
};

export class GoogleSheetsClient {
  private accessToken: string | null = null;
  private accessTokenExpiresAt = 0;

  constructor(private readonly config: GoogleSheetsConfig) {}

  async getValues(range: string) {
    const response = await this.request<SheetValuesResponse>(
      `/${this.config.spreadsheetId}/values/${this.getRange(range)}`,
    );

    return response.values ?? [];
  }

  async updateValues(range: string, values: string[][]) {
    await this.request(
      `/${this.config.spreadsheetId}/values/${this.getRange(range)}?valueInputOption=USER_ENTERED`,
      {
        method: "PUT",
        body: JSON.stringify({
          range: `${this.config.sheetName}!${range}`,
          majorDimension: "ROWS",
          values,
        }),
      },
    );
  }

  async appendValues(range: string, values: string[][]) {
    await this.request(
      `/${this.config.spreadsheetId}/values/${this.getRange(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: "POST",
        body: JSON.stringify({
          range: `${this.config.sheetName}!${range}`,
          majorDimension: "ROWS",
          values,
        }),
      },
    );
  }

  private getRange(range: string) {
    return encodeURIComponent(`${this.config.sheetName}!${range}`);
  }

  private async request<T = unknown>(
    path: string,
    init: RequestInit = {},
  ): Promise<T> {
    const accessToken = await this.getAccessToken();
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets${path}`,
      {
        ...init,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          ...init.headers,
        },
      },
    );

    if (!response.ok) {
      const message = await response.text();

      throw new Error(`Google Sheets 요청에 실패했습니다. ${message}`);
    }

    return (await response.json().catch(() => ({}))) as T;
  }

  private async getAccessToken() {
    if (this.accessToken && Date.now() < this.accessTokenExpiresAt) {
      return this.accessToken;
    }

    const now = Math.floor(Date.now() / 1000);
    const jwt = this.createJwt({
      iss: this.config.clientEmail,
      scope: GOOGLE_SHEETS_SCOPE,
      aud: this.config.tokenUri,
      exp: now + 3600,
      iat: now,
    });
    const response = await fetch(this.config.tokenUri, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    });

    if (!response.ok) {
      const message = await response.text();

      throw new Error(`Google 인증 토큰 발급에 실패했습니다. ${message}`);
    }

    const token = (await response.json()) as GoogleTokenResponse;

    this.accessToken = token.access_token;
    this.accessTokenExpiresAt = Date.now() + (token.expires_in - 60) * 1000;

    return this.accessToken;
  }

  private createJwt(claim: Record<string, string | number>) {
    const header = this.toBase64Url(
      JSON.stringify({
        alg: "RS256",
        typ: "JWT",
      }),
    );
    const payload = this.toBase64Url(JSON.stringify(claim));
    const signature = createSign("RSA-SHA256")
      .update(`${header}.${payload}`)
      .sign(this.normalizePrivateKey(this.config.privateKey));

    return `${header}.${payload}.${this.toBase64Url(signature)}`;
  }

  private normalizePrivateKey(privateKey: string) {
    return privateKey.replace(/\\n/g, "\n");
  }

  private toBase64Url(value: string | Buffer) {
    return Buffer.from(value)
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  }
}

export function getGoogleSheetsConfig(): GoogleSheetsConfig {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  const sheetName = process.env.GOOGLE_SHEETS_NAME;
  const serviceAccountKey = getServiceAccountKey();

  if (
    !spreadsheetId ||
    !sheetName ||
    !serviceAccountKey.client_email ||
    !serviceAccountKey.private_key
  ) {
    throw new Error(
      "Google Sheets 댓글 저장소 설정이 필요합니다. GOOLGE_SERVICE_ACCOUNT_KEY_JSON, GOOGLE_SHEETS_ID, GOOGLE_SHEETS_NAME을 설정해주세요.",
    );
  }

  return {
    spreadsheetId,
    clientEmail: serviceAccountKey.client_email,
    privateKey: serviceAccountKey.private_key,
    tokenUri: serviceAccountKey.token_uri ?? GOOGLE_TOKEN_URL,
    sheetName,
  };
}

function getServiceAccountKey(): GoogleServiceAccountKey {
  const keyJson = process.env.GOOLGE_SERVICE_ACCOUNT_KEY_JSON;

  if (!keyJson) {
    return {};
  }

  return JSON.parse(keyJson) as GoogleServiceAccountKey;
}
