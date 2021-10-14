import { crypto } from "./deps/std.ts";

function encodeString(contents: string): Uint8Array {
  return (new TextEncoder()).encode(contents)
}

function decodeBuffer(contents: Uint8Array | ArrayBuffer): string {
  return (new TextDecoder('utf-8')).decode(contents);
}

export function hashFileContents(contents: string): string {
  const result = crypto.subtle.digestSync('SHA-256', encodeString(contents));
  return decodeBuffer(result);
  /* const hasher = hash.createHash("sha256");
  return hasher.update(contents).toString(); */
}
