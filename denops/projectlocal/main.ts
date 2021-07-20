import { Denops, execute } from "./deps/denops_std.ts";
import { ensureString, isNumber } from "./deps/unknownutil.ts";
import { globals as g } from "./deps/denops_std.ts";
import { Config, makeConfig } from "./config.ts";
import { ProjectLocal } from "./init.ts";

export async function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    async echo(text: unknown): Promise<unknown> {
      ensureString(text);
      return await Promise.resolve(text);
    },
  };

  // Assert if plugin is loaded, using this file instead of `plugin/projectlocal.vim`
  const loaded = await g.get(denops, "loaded_projectlocal");
  if (isNumber(loaded) && loaded === 1) {
    Promise.resolve();
  }

  // Setup Config
  const userConfig = await g.get(denops, "projectlocal", null);
  let config: Config;

  if (userConfig) {
    config = await makeConfig(denops, userConfig);
  } else {
    config = await makeConfig(denops, {});
  }

  // Initialize checks on start
  const projectLocal = new ProjectLocal(denops, config);
  projectLocal.start();

  // Register commands after initialize
  const projectConfigFile = await config.getProjectConfigFilepath();
  const allowlistFile = config.getAllowlistPath();

  if (projectConfigFile) {
    await execute(
      denops,
      `command! ProjectLocalConfig edit ${projectConfigFile}`,
    );
  }

  await execute(
    denops,
    `command! ProjectLocalAllowlist edit ${allowlistFile}`,
  );
  await execute(
    denops,
    `command! ProjectLocalEnable echom "Manually load the config file"`,
  );

  // Plugin has been loaded
  await g.set(denops, "loaded_projectlocal", 1);
}
