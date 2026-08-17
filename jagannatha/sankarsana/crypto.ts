export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(new ArrayBuffer(hex.length / 2));

  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }

  return bytes;
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();

  const salt = new Uint8Array(new ArrayBuffer(16));
  crypto.getRandomValues(salt);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const hash = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 600_000,
      hash: "SHA-256",
    },
    keyMaterial,
    256,
  );

  return `${bytesToHex(salt)}:${bytesToHex(new Uint8Array(hash))}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const [saltHex, hashHex] = storedHash.split(":");

  if (!saltHex || !hashHex) {
    return false;
  }

  const encoder = new TextEncoder();

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const hash = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: hexToBytes(saltHex),
      iterations: 600_000,
      hash: "SHA-256",
    },
    keyMaterial,
    256,
  );

  const calculatedHash = new Uint8Array(hash);
  const storedHashBytes = hexToBytes(hashHex);

  if (calculatedHash.length !== storedHashBytes.length) {
    return false;
  }

  return calculatedHash.every((byte, index) => byte === storedHashBytes[index]);
}

export async function hashSessionToken(token: string): Promise<string> {
  const data = new TextEncoder().encode(token);
  const hash = await crypto.subtle.digest("SHA-256", data);

  return bytesToHex(new Uint8Array(hash));
}

export function generateSessionToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));

  return bytesToHex(bytes);
}
