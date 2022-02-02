import { Denops, fn, helpers } from "./deps/denops_std.ts";
import { fs } from "./deps/std.ts";
import { Config } from "./config.ts";
import * as allowlist from "./allowlist.ts";
import { hashFileContents } from "./hasher.ts";
import { ProjectLocalFileSystem } from "./fs.ts";

export class ProjectLocal {
  private configFile: string | null = "";

  constructor(private denops: Denops, private config: Config) {}

  /**
   * Detect the project config file and auto-source
   *
   * @returns {Promise<void>}
   */
  async start(): Promise<void> {
    await this.bootstrap();

    // Check if project config exists in current project root
    this.configFile = await this.config.getProjectConfigFilepath();

    if (this.configFile) {
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
    const projectConfig = allowlist.getProjectConfig(
      this.config,
      await this.config.getProjectRoot(),
    );
    if (!projectConfig?.autoload && !projectConfig?.ignore) {
      await this.sourceFile();
      await this.showMessage(
        "[projectlocal-vim] Manually sourced project config",
      );
    } else if (projectConfig?.ignore) {
      await this.showMessage(
        "[projectlocal-vim] Cannot source file, it's ignored",
      );
    }
  }

  /**
   * Prompt user for first time, to add the local config to the allowlist
   *
   * @returns {Promise<void>}
   */
  private async sourceOnFirstTime(): Promise<void> {
    const projectName = (await this.config.getProjectRoot())
      .split("/").slice(-1);

    const answer = await fn.confirm(
      this.denops,
      `[projectlocal-vim] New project config file found at: "${projectName}", do you trust to run this?`,
      "&Yes\n&No (Do not prompt again)\n&Open Config\n&Cancel",
      4,
    );

    if (answer === 1) {
      // Add to the allowlist and source the file
      await allowlist.addProjectConfigFile(
        this.config,
        this.configFile as string,
      );
      await this.sourceFile();
      await this.showMessage(
        "[projectlocal-vim] Added to the allow list and sourced!",
      );
    } else if (answer === 2) {
      // Add to the allowlist but with ignore set to true
      await allowlist.addProjectConfigFile(
        this.config,
        this.configFile as string,
        true,
      );
      await this.showMessage(
        "[projectlocal-vim] Ignored! Use :PLLoad to explicitly source the project config file",
      );
    } else if (answer === 3) {
      const fs = new ProjectLocalFileSystem(this.denops);
      fs.openLocalConfig(this.config);
    } else {
      await this.showMessage(
        "[projectlocal-vim] Cancelled! We will prompt again the next time you open vim",
      );
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
      await this.showMessage(
        "[projectlocal-vim] Cancelled! We will prompt again the next time you open vim",
      );
    }
  }

  /**
   * Prompt user to allow to source file if local config contents
   * have changed
   *
   * @returns {Promise<void>}
   */
  private async sourceOnAllowed(): Promise<void> {
    try {
      const projectConfig = allowlist.getProjectConfig(
        this.config,
        await this.config.getProjectRoot(),
      );

      const contents: string = Deno.readTextFileSync(this.configFile as string);
      const currentHash = await hashFileContents(contents);

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
    } catch (e) {
      if (typeof e === "string") {
        await helpers.execute(this.denops, e);
      } else {
        throw e;
      }
    }
  }

  /**
   * Ensure the allowlist file is created
   *
   * @returns {Promise<void>}
   */
  private async bootstrap(): Promise<void> {
    if (
      !(await ProjectLocalFileSystem.fileExists(this.config.getAllowlistPath()))
    ) {
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
    if (!isNvim05 && Config.isLua(this.configFile as string)) {
      const msg =
        `echom "[projectlocal-vim] nvim >= 0.5 is required for lua files"`;
      throw msg;
    }

    try {
      if (Config.isVim(this.configFile as string)) {
        await fn.execute(
          this.denops,
          `source ${this.configFile}`,
        );
      } else if (Config.isLua(this.configFile as string)) {
        await fn.execute(
          this.denops,
          `luafile ${this.configFile}`,
        );
      } else if (Config.isJson(this.configFile as string)) {
        const initJson = await ProjectLocalFileSystem.parseJsonFile(
          this.configFile as string,
        );

        // LSP Client
        if (isNvim05 && initJson.projectlocal["nvim-lsp"]) {
          const servers = JSON.stringify(initJson.projectlocal["nvim-lsp"]);
          await helpers.execute(
            this.denops,
            `lua require('projectlocal.lsp').register_lspservers([=[${servers}]=])`,
          );
        } else {
          this.showMessage(
            "[projectlocal-vim] nvim-lsp: nvim 0.5 and up is required",
          );
        }

        // Vim Variables
        if (initJson.projectlocal.globalVars) {
          const gvars = initJson.projectlocal.globalVars as Record<
            string,
            unknown
          >;

          for (const gvar in gvars) {
            // Ignore object prototype props
            if (gvars.hasOwnProperty(gvar)) {
              let jsonValue = gvars[gvar];
              if (typeof jsonValue === "object") {
                jsonValue = JSON.stringify(gvars[gvar]);
              }

              await helpers.execute(
                this.denops,
                `:let g:${gvar} = ${jsonValue}`,
              );
            }
          }
        }
      }
    } catch (_) {
      const msg =
        `echomsg "[projectlocal-vim] Internal error, check your projectConfig file"`;
      throw msg;
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
