import { Denops } from "./deps/denops_std.ts";
import { fs } from "./deps/std.ts";
import { Config } from "./config.ts";
import { projectLocalVimTemplate, projectLocalLuaTemplate } from "./templates.ts";

export class ProjectLocalFileSystem {
  constructor(private denops: Denops, private config: Config) {}

  async openLocalConfig(): Promise<void> {
    const filepath = await this.config.getProjectConfigFilepath();

    if (!fs.existsSync(filepath)) {
      await this.denops.cmd(`echo "[projectlocal-vim] Not detected, creating new local config file!"`);

      if (this.config.isProjectConfigLua()) {
        await Deno.writeTextFile(filepath, projectLocalLuaTemplate);
      } else {
        await Deno.writeTextFile(filepath, projectLocalVimTemplate);
      }
    }

    await this.denops.cmd(`edit ${filepath}`);
  }
}
