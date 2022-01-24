import { Denops, helpers } from "./deps/denops_std.ts";
import { fs } from "./deps/std.ts";
import { Config } from "./config.ts";
import {
  projectLocalJsonTemplate,
  projectLocalLuaTemplate,
  projectLocalVimTemplate,
} from "./templates.ts";

interface JsonLsp {
  name: string;
  lspconfig: {
    root_dir: string[];
    init_options: any;
    settings: any;
  };
}

interface PLInitJson {
  projectlocal: {
    lsp?: JsonLsp[];
    options?: { [key: string]: any };
    globalVars?: { [key: string]: any };
  };
}

export class PLFileSystem {
  constructor(private denops: Denops, private config: Config) {}

  async openLocalConfig(): Promise<void> {
    const filepath = await this.config.getProjectConfigFilepath();

    await helpers.execute(this.denops, `echom "${Deno.cwd()}"`);

    if (!(await PLFileSystem.fileExists(filepath))) {
      await helpers.echo(
        this.denops,
        "[projectlocal-vim] Not detected, creating new local config file!",
      );

      // Create file if it does not exists
      // so that we don't error out on writeTextFile
      await fs.ensureFile(filepath);

      if (this.config.isProjectConfigLua()) {
        await Deno.writeTextFile(filepath, projectLocalLuaTemplate);
      } else if (this.config.isProjectConfigVim()) {
        await Deno.writeTextFile(filepath, projectLocalVimTemplate);
      } else if (this.config.isProjectConfigJson()) {
        await Deno.writeTextFile(filepath, projectLocalJsonTemplate);
      }
    }

    await helpers.execute(this.denops, `edit ${filepath}`);
  }

  static async fileExists(filepath: string): Promise<boolean> {
    try {
      await Deno.stat(filepath);
      return true;
    } catch (_) {
      return false;
    }
  }

  static async parseJsonFile(filepath: string): Promise<PLInitJson> {
    try {
      const fileContents = await Deno.readTextFile(filepath);
      return JSON.parse(fileContents);
    } catch (e) {
      throw e;
    }
  }
}
