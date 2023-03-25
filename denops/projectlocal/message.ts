import { Denops, fn, helpers } from "./deps/denops_std.ts";

export const pluginName = "[projectlocal]";

/**
 * Message template to use for :echo messages.
 *
 * @param {string} msg
 * @returns {string}
 */
export function info(msg: string): string {
  return `${pluginName} ${msg}`;
}

/**
 * Echo error message to the :echoerr list.
 *
 * @async
 * @param {Denops} denops
 * @param {string} msg
 * @returns {Promise<void>}
 */
export async function showError(denops: Denops, msg: string): Promise<void> {
  await helpers.echoerr(denops, `${pluginName} Error: ${msg}`);
}

/**
 * Echo warning message to :echomsg with :echohl
 *
 * @async
 * @param {Denops} denops
 * @param {string} msg
 * @returns {Promise<void>}
 */
export async function showWarning(denops: Denops, msg: string): Promise<void> {
  await helpers.execute(
    denops,
    `echohl WarningMsg | echomsg "${pluginName} Warning: ${msg}" | echohl None`,
  );
}

/**
 * Prompt user for permission on first time session.
 *
 * @async
 * @param {Denops} denops
 * @returns {Promise<1 | 2 | 3 | 4>}
 */
export async function confirmFirstTime(denops: Denops): Promise<1 | 2 | 3 | 4> {
  const msg = "New config file found, include it?";
  return await fn.confirm(
    denops,
    `${info(msg)}`,
    "&Yes (Always)\n&No (Do not prompt again)\n&Open Config\n&Cancel",
    4,
  ) as 1 | 2 | 3 | 4;
}

/**
 * Prompt user for permission on config file changes.
 *
 * @async
 * @param {Denops} denops
 * @returns {Promise<1 | 2>}
 */
export async function confirmOnChange(denops: Denops): Promise<1 | 2> {
  const msg = "Config file changed, re-include changes?";
  return await fn.confirm(denops, `${info(msg)}`, "&Yes\n&No", 2) as
    | 1
    | 2;
}
