import { Denops, fn, helpers } from "./deps/denops_std.ts";
import {
  getConfig,
  getProjectConfigFilepath,
  getProjectRoot,
  isJson,
  isLua,
  isVimscript,
  registerBufNewFileEvents,
  UserConfig,
} from "./config.ts";
import { getHashFileContents } from "./hasher.ts";
import { AllowedItem, isAutoload, setAutoload } from "./allowlist.ts";
import {
  getAllowlist,
  projectConfigStatus,
  setAllowlist,
} from "./allowlist.ts";
import { confirmFirstTime, confirmOnChange, info } from "./message.ts";
import { sourceJson } from "./loaders/json/main.ts";

export async function main(denops: Denops) {
  denops.dispatcher = {
    /**
     * Detect if a config file is present in the project root directory
     * and as user for permission to source it or not
     *
     * @async
     * @returns {Promise<void>}
     */
    async discover(): Promise<void> {
      const config = await getConfig(denops);
      const projectRoot = await getProjectRoot(denops);
      const projectConfigFilepath = await getProjectConfigFilepath(denops);

      if (!projectConfigFilepath) {
        return;
      }

      const hash = await getHashFileContents(
        await Deno.readTextFile(projectConfigFilepath),
      );

      const status = await projectConfigStatus(denops, projectRoot, hash);
      switch (status) {
        case "new":
          await onNew(denops, config, projectRoot, hash);
          break;

        case "changed":
          await onChanged(denops, config, projectRoot, hash);
          break;

        case "equal":
        default:
          if (await isAutoload(denops, projectRoot)) {
            await sourceFile(denops, config);
          }
      }
    },

    /**
     * Manually load the config file, if it exists but autoload is disabled.
     *
     * @async
     * @returns {Promise<void>}
     */
    async load(): Promise<void> {
      const config = await getConfig(denops);
      const projectRoot = await getProjectRoot(denops);
      const projectConfigFilepath = await getProjectConfigFilepath(denops);

      if (projectConfigFilepath && !(await isAutoload(denops, projectRoot))) {
        await sourceFile(denops, config);
        await helpers.execute(denops, `echomsg 'Manually loaded config file!'`);
      }
    },

    /**
     * Enable autoload of config file in project root.
     *
     * @async
     * @returns {Promise<void>}
     */
    async autoloadEnable(): Promise<void> {
      const config = await getConfig(denops);
      const projectRoot = await getProjectRoot(denops);
      const projectConfigFilepath = await getProjectConfigFilepath(denops);

      if (projectConfigFilepath && !(await isAutoload(denops, projectRoot))) {
        await setAutoload(denops, projectRoot, true);
        await sourceFile(denops, config);
        await helpers.execute(
          denops,
          `echomsg 'Enabled autoloading of config file and sourced the file!'`,
        );
      }
    },

    /**
     * Disable autoload of config file in project root.
     *
     * @async
     * @returns {Promise<void>}
     */
    async autoloadDisable(): Promise<void> {
      const projectRoot = await getProjectRoot(denops);
      const projectConfigFilepath = await getProjectConfigFilepath(denops);

      if (projectConfigFilepath && (await isAutoload(denops, projectRoot))) {
        await setAutoload(denops, projectRoot, false);
        await helpers.execute(
          denops,
          `echomsg 'Disabled autoloading of config file!'`,
        );
      }
    },

    /**
     * Open config file on the project root, if it doesn't exist
     * then create one with a skeleton file.
     *
     * @async
     * @returns {Promise<void>}
     */
    async open(file: unknown): Promise<void> {
      const config = await getConfig(denops);
      const projectRoot = await getProjectRoot(denops);
      const projectConfigFilepath = await getProjectConfigFilepath(denops);
      const includesInConfig = (ft: string) =>
        Object.keys(config.rootFiles).includes(ft);

      if (projectConfigFilepath) {
        await helpers.execute(denops, `edit ${projectConfigFilepath}`);
      }

      const defaultFile = config.rootFiles[config.defaultRootFile];
      let filepath = `${projectRoot}/${defaultFile}`;

      if (typeof file === "string" && includesInConfig(file)) {
        filepath = `${projectRoot}/${config.rootFiles[file]}`;
      }

      await helpers.execute(denops, `edit +3 ${filepath}`);
    },
  };

  // Register events for template generation
  await registerBufNewFileEvents(denops);
}

/**
 * Handle if config file is newly added.
 *
 * @async
 * @param {Denops} denops
 * @param {UserConfig} config
 * @param {string} projectRoot
 * @param {string} hash
 * @returns {Promise<void>}
 */
async function onNew(
  denops: Denops,
  config: UserConfig,
  projectRoot: string,
  hash: string,
): Promise<void> {
  const projectConfigFilepath = await getProjectConfigFilepath(denops);
  const allowlist = await getAllowlist(denops);
  const allowedItem: AllowedItem = {
    projectRoot,
    hash,
    autoload: true,
  };

  const answer = await confirmFirstTime(denops);
  switch (answer) {
    case 1: // Yes
      await setAllowlist(denops, [...allowlist, allowedItem]);
      await sourceFile(denops, config);
      break;

    case 2: // No (Do not prompt)
      await setAllowlist(denops, [...allowlist, {
        ...allowedItem,
        autoload: false,
      }]);
      break;

    case 3: // Open config
      await helpers.execute(denops, `edit ${projectConfigFilepath}`);
      break;

    case 4: // Cancel
    default:
  }
}

/**
 * Handle if config file changes.
 *
 * @async
 * @param {Denops} denops
 * @param {UserConfig} config
 * @param {string} projectRoot
 * @param {string} hash
 * @returns {Promise<void>}
 */
async function onChanged(
  denops: Denops,
  config: UserConfig,
  projectRoot: string,
  hash: string,
): Promise<void> {
  const allowlist = await getAllowlist(denops);
  const allowedItem: AllowedItem = {
    projectRoot,
    hash,
    autoload: true,
  };

  const answer = await confirmOnChange(denops);
  switch (answer) {
    case 1: // Yes
      await setAllowlist(
        denops,
        allowlist.map((item) =>
          item.projectRoot === projectRoot ? { ...allowedItem } : item
        ),
      );
      await sourceFile(denops, config);
      break;

    case 2: // No
    default:
  }
}

/**
 * Source the config file.
 *
 * @async
 * @param {Denops} denops
 * @param {UserConfig} config
 * @returns {Promise<void>}
 */
async function sourceFile(denops: Denops, config: UserConfig): Promise<void> {
  const projectRoot = await getProjectRoot(denops);
  const filepath = await getProjectConfigFilepath(denops) as string;

  if (isVimscript(filepath)) {
    helpers.execute(denops, `source ${filepath}`);
  } else if (isLua(filepath)) {
    if (await fn.has(denops, "nvim-0.6")) {
      helpers.execute(denops, `source ${filepath}`);
    }
  } else if (isJson(filepath)) {
    sourceJson(denops, config, filepath);
  }

  if (config.enableMessages && await isAutoload(denops, projectRoot)) {
    helpers.execute(
      denops,
      `echomsg "${info("Loaded project config file")}"`,
    );
  }
}
