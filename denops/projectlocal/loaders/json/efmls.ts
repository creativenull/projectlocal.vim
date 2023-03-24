import type { Denops } from "../../deps/denops_std.ts";
import { helpers } from "../../deps/denops_std.ts";
import type { UserConfig } from "../../config.ts";

/**
 * Plugin to setup ALE linters and fixers.
 *
 * @async
 * @param {Denops} denops
 * @param {UserConfig} config
 * @param {EfmlsConfig} efmls
 * @returns {Promise<void>}
 */
export async function handle(
  denops: Denops,
  config: UserConfig,
  efmls: EfmlsConfig,
): Promise<void> {
  if (Object.entries(efmls).length === 0) {
    return;
  }

  const serializeEfmls = JSON.stringify(efmls);
  const serializeConfig = JSON.stringify(config);
  await helpers.execute(
    denops,
    `lua require("projectlocal.efmls").register([=[${serializeEfmls}]=], [=[${serializeConfig}]=])`,
  );
}

export type EfmlsConfig = {
  [lang: string]: {
    linter?: string | string[];
    formatter?: string | string[];
  };
};
