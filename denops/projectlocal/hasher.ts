import { crypto } from "https://deno.land/std@0.218.2/crypto/mod.ts";

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
