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
import { showWarning } from "../../message.ts";

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
  try {
    const rawContent = await Deno.readTextFile(filepath);
    const parsedContent = JSON.parse(rawContent) as JsonConfig;
    const { projectlocal } = parsedContent;

    if (projectlocal.globalVars) {
      await globalVarsHandler(
        denops,
        config,
        projectlocal.globalVars,
      );
    }

    if (projectlocal.ale) {
      await aleHandler(denops, config, projectlocal.ale);
    }

    if (projectlocal["nvim-lsp"]) {
      await handleProp(
        denops,
        config,
        nvimLspHandler,
        projectlocal,
        "nvim-lsp",
      );
    }

    if (projectlocal.efmls) {
      await handleProp(denops, config, efmlsHandler, projectlocal, "efmls");
    }

    if (projectlocal.diagnosticls) {
      await handleProp(
        denops,
        config,
        diagnosticlsHandler,
        projectlocal,
        "diagnosticls",
      );
    }

    if (projectlocal["null-ls"]) {
      await handleProp(denops, config, nullLsHandler, projectlocal, "null-ls");
    }
  } catch (_) {
    throw "Failed parsing the file, please check your json file.";
  }
}

type JsonHandler<T> = (
  denops: Denops,
  config: UserConfig,
  propConfig: T,
) => Promise<void>;

async function handleProp<T>(
  denops: Denops,
  config: UserConfig,
  handler: JsonHandler<T>,
  projectlocal: ProjectLocalConfig,
  prop: keyof ProjectLocalConfig,
): Promise<void> {
  if (await isNvim06(denops)) {
    await handler(
      denops,
      config,
      projectlocal[prop] as T,
    );
  } else {
    showWarning(denops, `Ignoring "${prop}", not supported in vim.`);
  }
}

export type JsonConfig = {
  projectlocal: ProjectLocalConfig;
};

export type ProjectLocalConfig = {
  "nvim-lsp"?: string[] | NvimLspConfig[];
  globalVars?: GlobalVarsConfig;
  ale?: AleConfig;
  efmls?: EfmlsConfig;
  diagnosticls?: DiagnosticlsConfig;
  "null-ls"?: NullLsConfig;
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
