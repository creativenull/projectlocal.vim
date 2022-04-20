import { Denops, fn } from "./deps/denops_std.ts";

export const pluginName = "projectlocal";

/**
 * Perpare message with plugin name prepended
 * @param {string} msg
 */
export function info(msg: string) {
  return `${pluginName} ${msg}`;
}

export async function confirmFirstTime(
  denops: Denops,
  msg: string,
) {
  return await fn.confirm(
    denops,
    `${pluginName} ${msg}`,
    "&Yes (Always)\n&No (Do not prompt again)\n&Open Config\n&Cancel",
    4,
  );
}

export async function confirmOnChange(
  denops: Denops,
  msg: string,
) {
  return await fn.confirm(denops, `${pluginName} ${msg}`, "&Yes\n&No", 2);
}
