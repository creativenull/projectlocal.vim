import { Denops, fn, nvimFn } from "./deps/denops_std.ts";
import { ProjectLocalFileSystem } from "./fs.ts";

export interface UserConfig {
  showMessage: boolean;
  file: string;
  debug: boolean;
}

export interface PartialUserConfig {
  showMessage?: boolean;
  file?: string;
  debug?: boolean;
}

const defaultConfig: UserConfig = {
  showMessage: true,
  file: "",
  debug: false,
};

export const possibleVimConfigFiles = [".vimrc", ".nvimrc"]
export const possibleLuaConfigFiles = [".vimrc.lua", ".nvimrc.lua"]
export const possibleJsonConfigFiles = [".vimrc.json", ".nvimrc.json"]

async function getDefaultCacheDirectory(denops: Denops): Promise<string> {
  let cachepath: unknown;
  if (await fn.has(denops, "nvim")) {
    cachepath = await nvimFn.stdpath(denops, "cache");
    return `${cachepath}/projectlocal`;
  } else {
    if (Deno.build.os === "darwin") {
      cachepath = "$HOME/Library/Caches/vim/projectlocal";
      return (await fn.expand(denops, cachepath)) as string;
    } else if (Deno.build.os === "windows") {
      cachepath = "$HOME\\AppData\\Temp\\vim\\projectlocal";
      return (await fn.expand(denops, cachepath)) as string;
    } else {
      cachepath = "$HOME/.cache/vim/projectlocal";
      return (await fn.expand(denops, cachepath)) as string;
    }
  }
}

export class Config {
  private allowlistName = "allowlist";
  private cacheDirectory = "";

  constructor(private denops: Denops, private config: UserConfig) {}

  static isLua(configFile: string): boolean {
    return configFile.endsWith(".lua");
  }

  static isVim(configFile: string): boolean {
    return configFile.endsWith(".vimrc") ||
      configFile.endsWith(".nvimrc") ||
      configFile.endsWith(".vim");
  }

  static isJson(configFile: string): boolean {
    return configFile.endsWith(".json");
  }

  setCacheDirectory(value: string): void {
    this.cacheDirectory = value;
  }

  getCacheDirectory(): string {
    return this.cacheDirectory;
  }

  getAllowlistPath(): string {
    return `${this.cacheDirectory}/${this.allowlistName}.json`;
  }

  async getProjectRoot(): Promise<string> {
    if (Deno.build.os === "windows") {
      const cwd = await fn.getcwd(this.denops, undefined) as string;
      return await fn.escape(this.denops, cwd, " \\") as string;
    } else {
      return (await fn.getcwd(this.denops, undefined)) as string;
    }
  }

  async getProjectConfigFilepath(): Promise<string | null> {
    const projectRoot = await this.getProjectRoot();

    if (this.config.file !== "") {
      const filepath = `${projectRoot}/${this.config.file}`;
      if (await ProjectLocalFileSystem.fileExists(filepath)) {
        return filepath;
      }
    }

    // Check for list of possible config files
    // if g:projectlocal.file not provided
    for (const configFile of possibleVimConfigFiles) {
      const filepath = `${projectRoot}/${configFile}`;
      if (await ProjectLocalFileSystem.fileExists(filepath)) {
        this.config.file = filepath;
        return filepath;
      }
    }

    for (const configFile of possibleLuaConfigFiles) {
      const filepath = `${projectRoot}/${configFile}`;
      if (await ProjectLocalFileSystem.fileExists(filepath)) {
        this.config.file = filepath;
        return filepath;
      }
    }

    for (const configFile of possibleJsonConfigFiles) {
      const filepath = `${projectRoot}/${configFile}`;
      if (await ProjectLocalFileSystem.fileExists(filepath)) {
        this.config.file = filepath;
        return filepath;
      }
    }

    return null;
  }

  canSendMessage(): boolean {
    return this.config.showMessage;
  }

  isDebugMode(): boolean {
    return this.config.debug;
  }
}

// Factory function to create a new Config class instance
export async function makeConfig(
  denops: Denops,
  config: PartialUserConfig,
): Promise<Config> {
  const userConfig: UserConfig = {
    ...defaultConfig,
    ...(config as UserConfig),
  };

  const pluginConfig = new Config(denops, userConfig);
  pluginConfig.setCacheDirectory(
    (await getDefaultCacheDirectory(denops)) as string,
  );

  return pluginConfig;
}
