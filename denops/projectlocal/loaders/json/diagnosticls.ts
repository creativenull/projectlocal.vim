// import type { Denops } from "../../deps/denops_std.ts";
// import { helpers } from "../../deps/denops_std.ts";
import type { Denops } from "jsr:@denops/std@^7.0.0";
import * as helpers from "jsr:@denops/std@^7.0.0/helper";
import type { UserConfig } from "../../config.ts";

/**
 * Plugin to setup ALE linters and fixers.
 *
 * @async
 * @param {Denops} denops
 * @param {UserConfig} config
 * @param {DiagnosticlsConfig} diagnosticls
 * @returns {Promise<void>}
 */
export async function handle(
  denops: Denops,
  config: UserConfig,
  diagnosticls: DiagnosticlsConfig,
): Promise<void> {
  if (Object.entries(diagnosticls).length === 0) {
    return;
  }

  const serializeDiagnosticls = JSON.stringify(diagnosticls);
  const serializeConfig = JSON.stringify(config);

  try {
    await helpers.execute(
      denops,
      `lua require("projectlocal.diagnosticls").register([=[${serializeDiagnosticls}]=], [=[${serializeConfig}]=])`,
    );
  } catch (_e) {
    // Catch but do nothing
  }
}

export type DiagnosticlsConfig = {
  [lang: string]: {
    linter?: string | string[];
    formatter?: string | string[];
  };
};
