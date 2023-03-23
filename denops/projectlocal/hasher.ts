import { createHash } from "./deps/std.ts";

/**
 * Generate a hash of the string contents.
 *
 * @async
 * @param {string} contents
 * @returns {Promise<string>}
 */
export async function getHashFileContents(contents: string): Promise<string> {
  const result = await createHash("SHA-256", contents);
  const arrayResult = Array.from(new Uint8Array(result));

  return arrayResult.map((b) => b.toString(16).padStart(2, "0")).join("");
}
