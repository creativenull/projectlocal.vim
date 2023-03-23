import { fs } from "./deps/std.ts";
import { Denops } from "./deps/denops_std.ts";
import { fileExists, getDefaultCacheDirectory } from "./fs.ts";

export type AllowedItem = {
  projectRoot: string;
  hash: string;
  autoload: boolean;
};

export type Allowlist = AllowedItem[];

const filename = "allowlist.json";

/**
 * Get parsed allowlist content.
 *
 * @async
 * @param {Denops} denops
 * @returns {Promise<Allowlist>}
 */
export async function getAllowlist(denops: Denops): Promise<Allowlist> {
  const cacheDir = await getDefaultCacheDirectory(denops);
  const allowlistFilepath = `${cacheDir}/${filename}`;

  if (!fileExists(allowlistFilepath)) {
    await fs.ensureFile(allowlistFilepath);
    await Deno.writeTextFile(allowlistFilepath, "[]");
  }

  const rawContent = await Deno.readTextFile(allowlistFilepath);
  const content = JSON.parse(rawContent);

  return content;
}

/**
 * Set allowlist items back into file.
 *
 * @async
 * @param {Denops} denops
 * @param {Allowlist} content
 * @returns {Promise<void>}
 */
export async function setAllowlist(
  denops: Denops,
  content: Allowlist,
): Promise<void> {
  const cacheDir = await getDefaultCacheDirectory(denops);
  const allowlistFilepath = `${cacheDir}/${filename}`;
  const rawContent = JSON.stringify(content);

  await Deno.writeTextFile(allowlistFilepath, rawContent);
}

/**
 * Get the status a project config file, if it exists
 * on the project directory, or if it newly created or
 * if it exists and changes were found.
 *
 * @async
 * @param {Denops} denops
 * @param {string} projectRoot
 * @param {string} hash
 * @returns {Promise<"new" | "changed" | "equal">}
 */
export async function projectConfigStatus(
  denops: Denops,
  projectRoot: string,
  hash: string,
): Promise<"new" | "changed" | "equal"> {
  const allowlist = await getAllowlist(denops);
  const projectRootResult = allowlist.filter((item) =>
    item.projectRoot === projectRoot
  );
  const hasMatchedProjectRoot = projectRootResult.length === 1;
  const hashResult = allowlist.filter((item) =>
    item.projectRoot === projectRoot && item.hash === hash
  );
  const hasMatchedHash = hashResult.length === 1;

  if (hasMatchedProjectRoot && hasMatchedHash) {
    return "equal";
  } else if (hasMatchedProjectRoot && !hasMatchedHash) {
    return "changed";
  } else {
    return "new";
  }
}

/**
 * Check if the autoload flag is set in the allowlist.
 *
 * @async
 * @param {Denops} denops
 * @param {string} projectRoot
 * @returns {Promise<boolean>}
 */
export async function isAutoload(
  denops: Denops,
  projectRoot: string,
): Promise<boolean> {
  const allowlist = await getAllowlist(denops);
  const result = allowlist.filter((item) =>
    item.projectRoot === projectRoot && item.autoload
  );

  return result.length === 1;
}

/**
 * Set the autoload flag in the allowlist file, provided by projectRoot.
 *
 * @async
 * @param {Denops} denops
 * @param {string} projectRoot
 * @param {boolean} value
 * @returns {Promise<void>}
 */
export async function setAutoload(
  denops: Denops,
  projectRoot: string,
  value: boolean,
): Promise<void> {
  const allowlist = await getAllowlist(denops);
  await setAllowlist(
    denops,
    allowlist.map((item) =>
      item.projectRoot === projectRoot ? { ...item, autoload: value } : item
    ),
  );
}
