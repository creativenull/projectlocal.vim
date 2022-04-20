import { Denops, fn, helpers } from "./deps/denops_std.ts";
import { info } from "./message.ts";
import { fs } from "./deps/std.ts";
import {
  Config,
  possibleJsonConfigFiles,
  possibleLuaConfigFiles,
  possibleVimConfigFiles,
} from "./config.ts";
import {
  projectLocalJsonTemplate,
  projectLocalLuaTemplate,
  projectLocalVimTemplate,
} from "./templates.ts";

interface NvimLspConfig {
  root_dir?: string[];
  filetypes?: string[];
  init_options?: unknown;
  settings?: unknown;
}

interface ProjectLocalNvimLspJson {
  [key: string]: boolean | NvimLspConfig;
}

interface ProjectLocalInitJson {
  projectlocal: {
    "nvim-lsp": ProjectLocalNvimLspJson;
    globalVars?: { [key: string]: unknown };
  };
}

export class ProjectLocalFileSystem {
  constructor(private denops: Denops) {}

  static async fileExists(filepath: string): Promise<boolean> {
    try {
      await Deno.stat(filepath);
      return true;
    } catch (_) {
      return false;
    }
  }

  static async parseJsonFile(filepath: string): Promise<ProjectLocalInitJson> {
    try {
      const fileContents = await Deno.readTextFile(filepath);
      return JSON.parse(fileContents);
    } catch (e) {
      throw e;
    }
  }

  async openLocalConfig(config: Config, configType?: string): Promise<void> {
    let configFile = await config.getProjectConfigFilepath();

    // File by platform: nvim or vim
    let plat = 0;
    if (await fn.has(this.denops, "nvim")) {
      plat = 1;
    }

    if (!configFile) {
      const projectRoot = await config.getProjectRoot();
      if (configType === "lua") {
        configFile = `${projectRoot}/${possibleLuaConfigFiles[plat]}`;
      } else if (configType === "json") {
        configFile = `${projectRoot}/${possibleJsonConfigFiles[plat]}`;
      } else {
        configFile = `${projectRoot}/${possibleVimConfigFiles[plat]}`;
      }

      await this.createConfigFile(configFile);
    } else if (
      !(await ProjectLocalFileSystem.fileExists(configFile as string))
    ) {
      await this.createConfigFile(configFile);
    }

    await helpers.execute(this.denops, `edit ${configFile}`);
  }

  private async createConfigFile(configFile: string): Promise<void> {
    await helpers.echo(
      this.denops,
      info("Not detected, creating new local config file!"),
    );

    // Create file if it does not exists
    // so that we don't error out on writeTextFile
    await fs.ensureFile(configFile);

    if (Config.isLua(configFile)) {
      await Deno.writeTextFile(configFile, projectLocalLuaTemplate);
    } else if (Config.isVim(configFile)) {
      await Deno.writeTextFile(configFile, projectLocalVimTemplate);
    } else if (Config.isJson(configFile)) {
      await Deno.writeTextFile(configFile, projectLocalJsonTemplate);
    }
  }
}
