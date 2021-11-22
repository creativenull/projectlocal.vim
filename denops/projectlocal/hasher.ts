import { crypto } from "./deps/std.ts";

function encodeString(contents: string): Uint8Array {
  return (new TextEncoder()).encode(contents);
}

export async function hashFileContents(contents: string): Promise<string> {
  const encodedContents = encodeString(contents);
  const result = await crypto.subtle.digest("SHA-256", encodedContents);
  const arrayResult = Array.from(new Uint8Array(result));
  return arrayResult.map((b) => b.toString(16).padStart(2, "0")).join("");
}
