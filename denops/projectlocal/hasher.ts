import { crypto } from "jsr:@std/crypto@0.218.2";

/**
 * Generate a hash of the string contents.
 */
export async function getHashFileContents(contents: string): Promise<string> {
  const encodedHash = await crypto.subtle.digest(
    "SHA-256",
    (new TextEncoder()).encode(contents),
  );
  return (new TextDecoder()).decode(encodedHash);
}
