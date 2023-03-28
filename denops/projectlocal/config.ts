import { Denops, fn, helpers, opt, vars } from "./deps/denops_std.ts";
import { fileExists } from "./fs.ts";

export type UserConfig = {
  enableMessages: boolean;
  defaultRootFile: string;
  rootFiles: {
    [ft: string]: string;
  };
  debugMode: boolean;
};

const pluginProp = "projectlocal";

const defaultConfig: UserConfig = {
  enableMessages: true,
  defaultRootFile: "json",
  rootFiles: {
    json: ".vimrc.json",
    lua: ".vimrc.lua",
    vim: ".vimrc",
  },
  debugMode: false,
};

export const isVimscript = (filepath: string) =>
  filepath.endsWith(".vim") || filepath.endsWith(".vimrc");
export const isLua = (filepath: string) => filepath.endsWith(".lua");
export const isJson = (filepath: string) => filepath.endsWith(".json");

/**
 * Get the config, else use defaults.
 *
 * @async
 * @param {Denops} denops
 * @returns {Promise<UserConfig>}
 */
export async function getConfig(denops: Denops): Promise<UserConfig> {
  const config = await vars.g.get(denops, pluginProp, defaultConfig);
  return { ...defaultConfig, ...config };
}

/**
 * Register file skeletons to generate templates for config files
 *
 * @async
 * @param {Denops} denops
 * @returns {Promise<void>}
 */
export async function registerBufNewFileEvents(denops: Denops): Promise<void> {
  const config = await getConfig(denops);

  for (const [_, filename] of Object.entries(config.rootFiles)) {
    const pluginDir = await getPluginDir(denops);

    if (pluginDir !== "") {
      let skeleton = `${pluginDir}/templates/skeleton.vim`;
      if (isLua(filename)) {
        skeleton = `${pluginDir}/templates/skeleton.lua`;
      } else if (isJson(filename)) {
        skeleton = `${pluginDir}/templates/skeleton.json`;
      }

      await helpers.execute(
        denops,
        `autocmd ProjectLocalEvents BufNewFile ${filename} 0r ${skeleton}`,
      );
    }
  }
}

async function getPluginDir(denops: Denops): Promise<string> {
  const rawRtp = await opt.runtimepath.get(denops);
  const rtp = rawRtp.split(",");
  const dir = rtp.find((item: string) => item.includes("projectlocal-vim"));

  return dir ?? "";
}

/**
 * Get the current project directory.
 *
 * @async
 * @param {Denops} denops
 * @returns {Promise<string>}
 */
export async function getProjectRoot(denops: Denops): Promise<string> {
  if (Deno.build.os === "windows") {
    const cwd = await fn.getcwd(denops) as string;
    return await fn.escape(denops, cwd, " \\") as string;
  } else {
    return (await fn.getcwd(denops)) as string;
  }
}

/**
 * Get the project config filepath.
 *
 * @async
 * @param {Denops} denops
 * @returns {Promise<string | null>}
 */
export async function getProjectConfigFilepath(
  denops: Denops,
): Promise<string | null> {
  const config = await getConfig(denops);
  const projectRoot = await getProjectRoot(denops);

  for (const [_, filename] of Object.entries(config.rootFiles)) {
    const filepath = `${projectRoot}/${filename}`;

    if (fileExists(filepath)) {
      return filepath;
    }
  }

  return null;
}
