import { Denops } from "./deps/denops_std.ts";
import { isNumber, isObject } from "./deps/unknownutil.ts";
import { vars } from "./deps/denops_std.ts";
import { PartialUserConfig, Config, makeConfig } from "./config.ts";
import { ProjectLocal } from "./projectlocal.ts";
import { ProjectLocalFileSystem } from "./fs.ts";
import * as allowlist from "./allowlist.ts";

export async function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    async autosource(): Promise<void> {
      const userConfig = await vars.g.get(denops, "projectlocal", null);
      let config: Config;

      if (isObject<PartialUserConfig>(userConfig)) {
        config = await makeConfig(denops, userConfig);
      } else {
        config = await makeConfig(denops, {});
      }

      const projectLocal = new ProjectLocal(denops, config);
      projectLocal.start();
    },

    async load(): Promise<void> {
      const userConfig = await vars.g.get(denops, "projectlocal", null);
      let config: Config;

      if (isObject<PartialUserConfig>(userConfig)) {
        config = await makeConfig(denops, userConfig);
      } else {
        config = await makeConfig(denops, {});
      }

      const projectLocal = new ProjectLocal(denops, config);
      projectLocal.manualSource();
    },

    async enable(): Promise<void> {
      const userConfig = await vars.g.get(denops, "projectlocal", null);
      let config: Config;

      if (isObject<PartialUserConfig>(userConfig)) {
        config = await makeConfig(denops, userConfig);
      } else {
        config = await makeConfig(denops, {});
      }

      allowlist.autoloadEnable(config);
      denops.cmd(`echo "[projectlocal-vim] Autoload enabled!"`);
    },

    async disable(): Promise<void> {
      const userConfig = await vars.g.get(denops, "projectlocal", null);
      let config: Config;

      if (isObject<PartialUserConfig>(userConfig)) {
        config = await makeConfig(denops, userConfig);
      } else {
        config = await makeConfig(denops, {});
      }

      allowlist.autoloadDisable(config);
      denops.cmd(`echo "[projectlocal-vim] Autoload disabled!"`);
    },

    async openLocalConfig(): Promise<void> {
      // Setup Config
      const userConfig = await vars.g.get(denops, "projectlocal", null);
      let config: Config;

      if (isObject<PartialUserConfig>(userConfig)) {
        config = await makeConfig(denops, userConfig);
      } else {
        config = await makeConfig(denops, {});
      }

      const fs = new ProjectLocalFileSystem(denops, config);
      fs.openLocalConfig()
    },
  };

  // Assert if plugin is loaded, using this file instead of `plugin/projectlocal.vim`
  const loaded = await vars.g.get(denops, "loaded_projectlocal");
  if (isNumber(loaded) && loaded === 1) {
    return;
  }

  await denops.cmd(`command! PLConfig call denops#notify('${denops.name}', 'openLocalConfig', [])`);
  await denops.cmd(`command! PLLoad call denops#notify('${denops.name}', 'load', [])`);
  await denops.cmd(`command! PLAutoloadEnable call denops#notify('${denops.name}', 'enable', [])`);
  await denops.cmd(`command! PLAutoloadDisable call denops#notify('${denops.name}', 'disable', [])`);

  await vars.g.set(denops, "loaded_projectlocal", 1);
}
