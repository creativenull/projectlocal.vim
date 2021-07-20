import { createHash } from "./deps/std.ts";

export function hashFileContents(contents: string): string {
  const hasher = createHash("sha256");
  return hasher.update(contents).toString();
}
