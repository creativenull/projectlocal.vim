import { Denops, fn, nvimFn } from "./deps/denops_std.ts";

export interface UserConfig {
  showMessage: boolean;
  projectConfig: string;
  debug: boolean;
}

export interface PartialUserConfig {
  showMessage?: boolean;
  projectConfig?: string;
  debug?: boolean;
}

const defaultConfig: UserConfig = {
  showMessage: true,
  projectConfig: ".vim/init.vim",
  debug: false,
};

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
      cachepath = "$HOME/AppData/Temp/vim/projectlocal";
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
    return (await fn.getcwd(this.denops, undefined)) as string;
  }

  async getProjectConfigFilepath(): Promise<string> {
    const projectRoot = await this.getProjectRoot();
    return `${projectRoot}/${this.config.projectConfig}`;
  }

  isProjectConfigLua(): boolean {
    return this.config.projectConfig.endsWith(".lua");
  }

  isProjectConfigVim(): boolean {
    return this.config.projectConfig.endsWith(".vim");
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
