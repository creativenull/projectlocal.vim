import { Denops, fn, helpers } from "./deps/denops_std.ts";
import { fs } from "./deps/std.ts";
import { Config } from "./config.ts";
import * as allowlist from "./allowlist.ts";
import { hashFileContents } from "./hasher.ts";
import { ProjectLocalFileSystem } from "./fs.ts";
import { confirmFirstTime, confirmOnChange, info } from "./message.ts";

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
      await this.showMessage("Sourcing local config manually");
    } else if (projectConfig?.ignore) {
      await this.showMessage("Cannot source ignored file (check settings)");
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

    const answer = await confirmFirstTime(
      this.denops,
      `Local config found: "${projectName}", allow source?`,
    );

    if (answer === 1) {
      // Add to the allowlist and source the file
      await allowlist.addProjectConfigFile(
        this.config,
        this.configFile as string,
      );
      await this.sourceFile();
      await this.showMessage("Added to the allowlist and sourced!");
    } else if (answer === 2) {
      // Add to the allowlist but with ignore set to true
      await allowlist.addProjectConfigFile(
        this.config,
        this.configFile as string,
        true,
      );
      await this.showMessage(
        "Ignored! Use :ProjectLocalLoad to explicitly source the local config",
      );
    } else if (answer === 3) {
      const fs = new ProjectLocalFileSystem(this.denops);
      fs.openLocalConfig(this.config);
    } else {
      await this.showMessage("Cancelled! Will prompt again next time");
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
    const answer = await confirmOnChange(
      this.denops,
      "Local config modified, accept changes?",
    );

    if (answer === 1) {
      allowlist.updateProjectConfigFile(this.config, { configFileHash: hash });
      await this.sourceFile();
      await this.showMessage("Local config loaded!");
    } else {
      await this.showMessage("Cancelled! Will prompt again next time");
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
          await this.showMessage("Local config loaded!");
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
    const nvimFailMsg = "nvim >= 0.5 is required for lua files";
    const isNvim05 = await fn.has(this.denops, "nvim-0.6");

    if (!isNvim05 && Config.isLua(this.configFile as string)) {
      throw `echom ${info(nvimFailMsg)}`;
    }

    try {
      if (Config.isVim(this.configFile as string)) {
        await fn.execute(this.denops, `source ${this.configFile}`);
      } else if (Config.isLua(this.configFile as string)) {
        await fn.execute(this.denops, `luafile ${this.configFile}`);
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
          this.showMessage(nvimFailMsg);
        }

        // Vim Variables
        if (initJson.projectlocal.globalVars) {
          const gvars = initJson.projectlocal.globalVars as Record<
            string,
            unknown
          >;

          for (const gvar in gvars) {
            // Ignore object prototype props
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
    } catch (_) {
      throw `echomsg ${
        info(
          "Internal error, check your local config file! Manually source the file with `:source` to check for problems",
        )
      }`;
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
      await helpers.echo(this.denops, info(msg));
    }
  }
}
