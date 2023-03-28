import type { Denops } from "../../deps/denops_std.ts";
import { helpers } from "../../deps/denops_std.ts";
import type { UserConfig } from "../../config.ts";

/**
 * Plugin to setup ALE linters and fixers.
 *
 * @async
 * @param {Denops} denops
 * @param {UserConfig} _config
 * @param {AleConfig} ale
 * @returns {Promise<void>}
 */
export async function handle(
  denops: Denops,
  _config: UserConfig,
  ale: AleConfig,
): Promise<void> {
  if (ale.linters) {
    for (const [ft, lvalue] of Object.entries(ale.linters)) {
      const svalue = JSON.stringify(lvalue);
      await helpers.execute(
        denops,
        `autocmd ProjectLocalEvents FileType ${ft} let b:ale_linters = ${svalue}`,
      );
    }
  }

  if (ale.fixers) {
    for (const [ft, lvalue] of Object.entries(ale.fixers)) {
      const svalue = JSON.stringify(lvalue);
      await helpers.execute(
        denops,
        `autocmd ProjectLocalEvents FileType ${ft} let b:ale_fixers = ${svalue}`,
      );
    }
  }
}

type AleFileType = string;

export type AleConfig = {
  linters?: Record<AleFileType, string[]>;
  fixers?: Record<AleFileType, string[]>;
};
