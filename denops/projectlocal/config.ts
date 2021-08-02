import { Denops, nvimFn, has, expand, getcwd } from "./deps/denops_std.ts";

export interface UserConfig {
  allowlistName: string;
  cacheDirectory: string;
  showMessage: boolean;
  projectConfig: {
    filepath: string;
  };
}

export interface PartialUserConfig {
  allowlistName?: string;
  cacheDirectory?: string;
  showMessage?: boolean;
  projectConfig?: {
    filepath?: string;
  };
}

const defaultConfig: UserConfig = {
  allowlistName: "allowlist",
  cacheDirectory: "",
  showMessage: true,
  projectConfig: {
    filepath: ".vim/init.vim",
  },
};

export class Config {
  constructor(private denops: Denops, private config: UserConfig) {}

  static async getDefaultCacheDirectory(denops: Denops): Promise<string> {
    let cachepath: unknown;
    if (await has(denops, "nvim")) {
      cachepath = await nvimFn.stdpath(denops, "cache");
      return `${cachepath}/projectlocal`;
    } else {
      // TODO: Find out how to remove type conversion from string to unknown
      if (Deno.build.os === "linux") {
        cachepath = "$HOME/.cache/vim/projectlocal";
        // @ts-expect-error: Unknown type conversion
        return await expand(denops, cachepath);
      } else if (Deno.build.os === "windows") {
        cachepath = "$HOME/AppData/Temp/vim/projectlocal";
        // @ts-expect-error: Unknown type conversion
        return await expand(denops, cachepath);
      } else {
        cachepath = "$HOME/Library/Caches/vim/projectlocal";
        // @ts-expect-error: Unknown type conversion
        return await expand(denops, cachepath);
      }
    }
  }

  getCacheDirectory(): string {
    return this.config.cacheDirectory;
  }

  getAllowlistPath(): string {
    return `${this.config.cacheDirectory}/${this.config.allowlistName}.json`;
  }

  async getProjectRoot(): Promise<string> {
    return (await getcwd(this.denops, 0, 0)) as string;
  }

  async getProjectConfigFilepath(): Promise<string> {
    const projectRoot = await this.getProjectRoot();
    return `${projectRoot}/${this.config.projectConfig.filepath}`;
  }

  isProjectConfigLua(): boolean {
    return this.config.projectConfig.filepath.endsWith(".lua");
  }

  isProjectConfigVim(): boolean {
    return this.config.projectConfig.filepath.endsWith(".vim");
  }
}

// Factory function to create a new Config class instance
export async function makeConfig(denops: Denops, config: PartialUserConfig): Promise<Config> {
  const userConfig: UserConfig = {
    ...defaultConfig,
    cacheDirectory: config.cacheDirectory ?? (await Config.getDefaultCacheDirectory(denops)),
  };

  return new Config(denops, userConfig);
}
