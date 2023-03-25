import type { Denops } from "../../deps/denops_std.ts";
import { helpers } from "../../deps/denops_std.ts";
import type { UserConfig } from "../../config.ts";

/**
 * Plugin to setup ALE linters and fixers.
 *
 * @async
 * @param {Denops} denops
 * @param {UserConfig} config
 * @param {NullLsConfig} nullLs
 * @returns {Promise<void>}
 */
export async function handle(
  denops: Denops,
  config: UserConfig,
  nullLs: NullLsConfig,
): Promise<void> {
  if (nullLs.length === 0) {
    return;
  }

  const serializeEfmls = JSON.stringify(nullLs);
  const serializeConfig = JSON.stringify(config);

  await helpers.execute(
    denops,
    `lua require("projectlocal.null-ls").register([=[${serializeEfmls}]=], [=[${serializeConfig}]=])`,
  );
}

export type NullLsConfig = string[];
