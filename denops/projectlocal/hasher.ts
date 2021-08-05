import { hash } from "./deps/std.ts";

export function hashFileContents(contents: string): string {
  const hasher = hash.createHash("sha256");
  return hasher.update(contents).toString();
}
