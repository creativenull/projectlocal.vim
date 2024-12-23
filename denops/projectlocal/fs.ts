// import { Denops, fn, nvimFn } from "./deps/denops_std.ts";
import type { Denops } from "jsr:@denops/std@^7.0.0";
import * as fn from "jsr:@denops/std@^7.0.0/function";
import * as nvimFn from "jsr:@denops/std@^7.0.0/function/nvim";

/**
 * Check if file exists in the filepath.
 *
 * @param {string} filepath
 * @returns {boolean}
 */
export function fileExists(filepath: string): boolean {
  try {
    Deno.lstatSync(filepath);
    return true;
  } catch (_e) {
    return false;
  }
}

/**
 * Get the cache directory depending on the platform.
 *
 * @async
 * @param {Denops} denops
 * @returns {Promise<string>}
 */
export async function getDefaultCacheDirectory(
  denops: Denops,
): Promise<string> {
  let cachepath: unknown;
  if (await fn.has(denops, "nvim")) {
    cachepath = await nvimFn.stdpath(denops, "cache");
    return `${cachepath}/projectlocal`;
  } else {
    if (Deno.build.os === "darwin") {
      cachepath = "$HOME/Library/Caches/vim/projectlocal";
      return (await fn.expand(denops, cachepath)) as string;
    } else if (Deno.build.os === "windows") {
      cachepath = "$HOME\\AppData\\Temp\\vim\\projectlocal";
      return (await fn.expand(denops, cachepath)) as string;
    } else {
      cachepath = "$HOME/.cache/vim/projectlocal";
      return (await fn.expand(denops, cachepath)) as string;
    }
  }
}
