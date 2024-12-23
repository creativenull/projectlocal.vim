// import type { Denops } from "../../deps/denops_std.ts";
// import { helpers } from "../../deps/denops_std.ts";
import type { Denops } from "jsr:@denops/std@^7.0.0";
import * as helpers from "jsr:@denops/std@^7.0.0/helper";
import type { UserConfig } from "../../config.ts";

/**
 * Plugin to setup nvim-lsp servers.
 *
 * @async
 * @param {Denops} denops
 * @param {UserConfig} config
 * @param {string[] | NvimLspConfig[]} nvimLspContext
 * @returns {Promise<void>}
 */
export async function handle(
  denops: Denops,
  config: UserConfig,
  nvimLspContext: string[] | NvimLspConfig[],
): Promise<void> {
  const serializeConfig = JSON.stringify(config);
  const serializeContext = JSON.stringify(nvimLspContext);
  await helpers.execute(
    denops,
    `lua require("projectlocal.lsp").register([=[${serializeContext}]=], [=[${serializeConfig}]=])`,
  );
}

export type NvimLspConfig = {
  name: string;
  config?: {
    init_options?: Record<string, unknown>;
    settings?: Record<string, unknown>;
    root_dir?: Record<string, unknown>;
    filetypes?: string[];
    single_file_support?: boolean;
  };
};
