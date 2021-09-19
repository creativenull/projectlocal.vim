import { Denops, fn, helpers } from "./deps/denops_std.ts";
import { fs } from "./deps/std.ts";
import { Config } from "./config.ts";
import * as allowlist from "./allowlist.ts";
import { hashFileContents } from "./hasher.ts";
import { ProjectLocalFileSystem } from "./fs.ts";

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
    if (fs.existsSync(await this.config.getProjectConfigFilepath())) {
      // Check if project root is allowed to be sourced
      if (await allowlist.isAllowed(this.config)) {
        this.sourceOnAllowed();
      } else {
        this.sourceOnFirstTime();
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
    if (!projectConfig?.autoload && !projectConfig?.ignore) {
      await this.sourceFile();
      await this.showMessage("[projectlocal-vim] Manually sourced project config");
    } else if (projectConfig?.ignore) {
      await this.showMessage("[projectlocal-vim] Cannot source file, it's ignored");
    }
  }

  /**
   * Prompt user for first time, to add the local config to the allowlist
   *
   * @returns {Promise<void>}
   */
  private async sourceOnFirstTime(): Promise<void> {
    const projectName = (await this.config.getProjectRoot()).split("/").slice(-1);

    const answer = await fn.confirm(
      this.denops,
      `[projectlocal-vim] New project config file found at: "${projectName}", do you trust to run this?`,
      "&Yes\n&No (Do not prompt again)\n&Open Config\n&Cancel",
      4,
    );

    if (answer === 1) {
      // Add to the allowlist and source the file
      await allowlist.addProjectConfigFile(this.config);
      await this.sourceFile();
      await this.showMessage("[projectlocal-vim] Added to the allow list and sourced!");
    } else if (answer === 2) {
      // Add to the allowlist but with ignore set to true
      await allowlist.addProjectConfigFile(this.config, true);
      await this.showMessage("[projectlocal-vim] Ignored! Use :PLLoad to explicitly source the project config file");
    } else if (answer === 3) {
      const fs = new ProjectLocalFileSystem(this.denops, this.config);
      fs.openLocalConfig();
    } else {
      await this.showMessage("[projectlocal-vim] Cancelled! We will prompt again the next time you open vim");
    }
  }

  /**
   * Prompt user to allow to source file if local config contents
   * have changed
   *
   * @param {string} hash
   * @returns {Promise<void>}
   */
  private async sourceOnHashChange(hash: string): Promise<void> {
    const answer = await fn.confirm(
      this.denops,
      `[projectlocal-vim] Project config file changed, re-source file?`,
      "&Yes\n&No",
      2,
    );

    if (answer === 1) {
      allowlist.updateProjectConfigFile(this.config, { configFileHash: hash });
      await this.sourceFile();
      await this.showMessage("[projectlocal-vim] Project config loaded!");
    } else {
      await this.showMessage("[projectlocal-vim] Cancelled! We will prompt again the next time you open vim");
    }
  }

  /**
   * Prompt user to allow to source file if local config contents
   * have changed
   *
   * @returns {Promise<void>}
   */
  private async sourceOnAllowed(): Promise<void> {
    const projectConfig = allowlist.getProjectConfig(this.config, await this.config.getProjectRoot());
    const contents: string = Deno.readTextFileSync(await this.config.getProjectConfigFilepath());
    const currentHash = hashFileContents(contents);

    // Check if file has been updated
    if (projectConfig?.configFileHash !== currentHash) {
      this.sourceOnHashChange(currentHash);
    } else {
      if (!projectConfig?.ignore && projectConfig?.autoload) {
        // Only source if it's not ignored
        await this.sourceFile();
        await this.showMessage("[projectlocal-vim] Project config loaded!");
      }
    }
  }

  /**
   * Ensure the allowlist file is created
   *
   * @returns {Promise<void>}
   */
  private async bootstrap(): Promise<void> {
    if (!fs.existsSync(this.config.getAllowlistPath())) {
      await fs.ensureFile(this.config.getAllowlistPath());
    }
  }

  /**
   * Source the project config file, for lua file, make sure
   * it's running nvim 0.5 and up
   *
   * @returns {Promise<void>}
   */
  private async sourceFile(): Promise<void> {
    const isNvim05 = await fn.has(this.denops, "nvim-0.5");
    if (!isNvim05 && this.config.isProjectConfigLua()) {
      const msg = `echomsg "[projectlocal-vim] Lua file only works with neovim v0.5 and up, use .vim file instead"`;
      await helpers.execute(this.denops, msg);
      return;
    }

    try {
      await fn.execute(this.denops, `source ${await this.config.getProjectConfigFilepath()}`);
    } catch (_) {
      const msg = `echomsg "[projectlocal-vim] Unable to source the file, check local file for any errors"`;
      await helpers.execute(this.denops, msg);
    }
  }

  /**
   * Show message on the command line (default: on)
   *
   * @param {string} msg
   * @returns {Promise<void>}
   */
  private async showMessage(msg: string): Promise<void> {
    if (this.config.canSendMessage()) {
      await helpers.echo(this.denops, msg);
    }
  }
}
