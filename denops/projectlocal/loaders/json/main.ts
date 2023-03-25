import type { Denops } from "../../deps/denops_std.ts";
import { fn, vars } from "../../deps/denops_std.ts";
import type { UserConfig } from "../../config.ts";
import { handle as nvimLspHandler } from "./nvim-lsp.ts";
import type { NvimLspConfig } from "./nvim-lsp.ts";
import { handle as aleHandler } from "./ale.ts";
import type { AleConfig } from "./ale.ts";
import { handle as efmlsHandler } from "./efmls.ts";
import type { EfmlsConfig } from "./efmls.ts";
import { handle as diagnosticlsHandler } from "./diagnosticls.ts";
import type { DiagnosticlsConfig } from "./diagnosticls.ts";
import { handle as nullLsHandler } from "./null-ls.ts";
import type { NullLsConfig } from "./null-ls.ts";

const isNvim06 = async (denops: Denops) => await fn.has(denops, "nvim-0.6");

/**
 * Parse the json file and run different providers setup.
 *
 * @async
 * @param {Denops} denops
 * @param {UserConfig} config
 * @param {string} filepath
 * @returns {Promise<void>}
 */
export async function sourceJson(
  denops: Denops,
  config: UserConfig,
  filepath: string,
): Promise<void> {
  const rawContent = await Deno.readTextFile(filepath);
  const parsedContent = JSON.parse(rawContent) as JsonConfig;

  if ((await isNvim06(denops)) && parsedContent.projectlocal["nvim-lsp"]) {
    await nvimLspHandler(denops, config, parsedContent.projectlocal["nvim-lsp"]);
  }

  if (parsedContent.projectlocal.globalVars) {
    await globalVarsHandler(
      denops,
      config,
      parsedContent.projectlocal.globalVars,
    );
  }

  if (parsedContent.projectlocal.ale) {
    await aleHandler(denops, config, parsedContent.projectlocal.ale);
  }

  if (parsedContent.projectlocal.efmls) {
    await efmlsHandler(denops, config, parsedContent.projectlocal.efmls);
  }

  if (parsedContent.projectlocal.diagnosticls) {
    await diagnosticlsHandler(denops, config, parsedContent.projectlocal.diagnosticls);
  }

  if ((await isNvim06(denops)) && parsedContent.projectlocal["null-ls"]) {
    await nullLsHandler(denops, config, parsedContent.projectlocal["null-ls"]);
  }
}

export type JsonConfig = {
  projectlocal: {
    "nvim-lsp"?: string[] | NvimLspConfig[];
    globalVars?: GlobalVarsConfig;
    ale?: AleConfig;
    efmls?: EfmlsConfig;
    diagnosticls?: DiagnosticlsConfig;
    "null-ls"?: NullLsConfig;
  };
};

/**
 * Plugin to setup vim/nvim global vars (g:).
 *
 * @async
 * @param {Denops} denops
 * @param {UserConfig} _config
 * @param {GlobalVarsConfig} globalVars
 * @returns {Promise<void>}
 */
async function globalVarsHandler(
  denops: Denops,
  _config: UserConfig,
  globalVars: GlobalVarsConfig,
): Promise<void> {
  for (const [gkey, gvalue] of Object.entries(globalVars)) {
    await vars.g.set(denops, gkey, gvalue);
  }
}

export type GlobalVarsConfig = Record<string, unknown>;
