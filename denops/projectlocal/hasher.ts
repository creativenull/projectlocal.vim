import { crypto } from "./deps/std.ts";

function encodeString(contents: string): Uint8Array {
  return (new TextEncoder()).encode(contents);
}

export function hashFileContents(contents: string): string {
  const encodedContents = encodeString(contents);
  const hashedResult = crypto.subtle.digestSync("SHA-256", encodeString);
  const decodedResult = Array.from(new Uint8Array(hashedResult));
  const hexStringResult = decodedResult
    .map((b) => b.toString(16).padStart(2, "0")).join("");
  return hexStringResult;
}
