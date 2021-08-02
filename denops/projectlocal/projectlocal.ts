import { Denops, inputsave, inputrestore, input, echo, execute, has } from "./deps/denops_std.ts";
import { existsSync, ensureFile } from "./deps/std.ts";
import { Config } from "./config.ts";
import * as allowlist from "./allowlist.ts";
import { hashFileContents } from "./hasher.ts";

export class ProjectLocal {
  constructor(private denops: Denops, private config: Config) {}

  /**
   * Detect the project config file and auto-source
   *
   * @returns {Promise<void>}
   */
  async start(): Promise<void> {
    await this.bootstrap();

    // Check if project config exists in current project root
    if (existsSync(await this.config.getProjectConfigFilepath())) {
      // Check if project root is allowed to be sourced
      if (allowlist.isAllowed(this.config)) {
        const projectConfig = allowlist.getProjectConfig(this.config, await this.config.getProjectRoot());

        // Check if sourcing is to be automated
        if (projectConfig?.autoload) {
          const contents: string = Deno.readTextFileSync(await this.config.getProjectConfigFilepath());
          const currentHash = hashFileContents(contents);

          // Check if file has been updated
          if (projectConfig?.configFileHash !== currentHash) {
            // Prompt user to accept the changes
            // and source the file
            await inputsave(this.denops);
            const answer = await input(
              this.denops,
              `[projectlocal-vim] Project config file changed, re-source file? (y/N) `,
            );
            await inputrestore(this.denops);

            if (answer === "y") {
              allowlist.updateProjectConfigFile(this.config, { configFileHash: currentHash });
              await this.sourceFile();
              await this.showMessage("[projectlocal-vim] Project config loaded!");
              // await echo(this.denops, "[projectlocal-vim] Project config loaded!");
            }
          } else {
            await this.sourceFile();
            await this.showMessage("[projectlocal-vim] Project config loaded!");
            // await echo(this.denops, "[projectlocal-vim] Project config loaded!");
          }
        }
      } else {
        // Prompt user if they want to add the file to allowlist
        // and source the file
        const projectName = (await this.config.getProjectRoot()).split("/").slice(-1);

        await inputsave(this.denops);
        const answer = await input(
          this.denops,
          `[projectlocal-vim] New project config file found at: "${projectName}", add to allowlist? (y/n/C) `,
        );
        await inputrestore(this.denops);

        if (answer === "y") {
          // Add to the allowlist and source the file
          await allowlist.addProjectConfigFile(this.config);
          await this.sourceFile();
          await this.showMessage("[projectlocal-vim] Added and sourced!");
          // await echo(this.denops, "[projectlocal-vim] Added and sourced!");
        } else if (answer === "n") {
          // Add to the allowlist but with ignore set to true
          await allowlist.addProjectConfigFile(this.config, true);
          await this.showMessage("[projectlocal-vim] Ignored! Use :ProjectLocalLoad to explicitly source the project config file")
        }
      }
    }
  }

  /**
   * Manually source the project config file, only when autoload
   * is disabled
   *
   * @returns {Promise<void>}
   */
  async manualSource(): Promise<void> {
    const projectConfig = allowlist.getProjectConfig(this.config, await this.config.getProjectRoot());
    if (!projectConfig?.autoload) {
      await this.sourceFile();
      await this.showMessage("[projectlocal-vim] Manually sourced project config!");
    }
  }

  /**
   * Ensure the allowlist file is created
   *
   * @returns {Promise<void>}
   */
  private async bootstrap(): Promise<void> {
    if (!existsSync(this.config.getAllowlistPath())) {
      await ensureFile(this.config.getAllowlistPath());
    }
  }

  /**
   * Source the project config file, for lua file, make sure
   * it's running nvim 0.5 and up
   *
   * @returns {Promise<void>}
   */
  private async sourceFile(): Promise<void> {
    const isNvim05 = await has(this.denops, "nvim-0.5");
    if (!isNvim05 && this.config.isProjectConfigLua()) {
      // We want to log this to the message history
      const msg = `echomsg "[projectlocal-vim] Lua file only works with neovim v0.5 and up, use .vim file instead"`
      await this.denops.cmd(msg);
      return;
    }

    await execute(this.denops, `source ${await this.config.getProjectConfigFilepath()}`);
  }

  private async showMessage(msg: string): Promise<void> {
    if (this.config.canSendMessage()) {
      await echo(this.denops, msg);
    }
  }
}
