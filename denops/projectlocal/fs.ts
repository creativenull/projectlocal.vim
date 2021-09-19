import { Denops, helpers } from "./deps/denops_std.ts";
import { fs } from "./deps/std.ts";
import { Config } from "./config.ts";
import { projectLocalVimTemplate, projectLocalLuaTemplate } from "./templates.ts";

export class ProjectLocalFileSystem {
  constructor(private denops: Denops, private config: Config) {}

  async openLocalConfig(): Promise<void> {
    const filepath = await this.config.getProjectConfigFilepath();

    await helpers.execute(this.denops, `echom "${Deno.cwd()}"`);

    if (!fs.existsSync(filepath)) {
      await helpers.echo(this.denops, "[projectlocal-vim] Not detected, creating new local config file!");

      // Create file if it does not exists
      await fs.ensureFile(filepath);

      if (this.config.isProjectConfigLua()) {
        await Deno.writeTextFile(filepath, projectLocalLuaTemplate);
      } else {
        await Deno.writeTextFile(filepath, projectLocalVimTemplate);
      }
    }

    await helpers.execute(this.denops, `edit ${filepath}`);
  }
}
