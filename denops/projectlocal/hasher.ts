// import { crypto } from "https://deno.land/std@0.218.2/crypto/mod.ts";
import { crypto } from "jsr:@std/crypto@^1.0.0";

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
