import { createHash } from "./deps/std.ts";

export async function hashFileContents(contents: string): Promise<string> {
  const result = await createHash("SHA-256", contents);
  const arrayResult = Array.from(new Uint8Array(result));
  return arrayResult.map((b) => b.toString(16).padStart(2, "0")).join("");
}
