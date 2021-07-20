import { Denops } from "./deps/denops_std.ts";
import { existsSync } from "./deps/std.ts";
import { Config } from "./config.ts";
import * as allowlist from "./allowlist.ts";
import { hashFileContents } from "./hasher.ts";

export class ProjectLocal {
  constructor(private denops: Denops, private config: Config) {}

  async start() {
    // 1. Detect if local config is present
    // 2. If detected, then check if in allowlist
    // 3. If found, check if autoload is enabled
    // 4. If enabled, then check if hash is different
    // 5. If different, then prompt user to confirm executing local config
    // 6. If disabled, then do nothing
    // 7. If not found, then do nothing
    // 8. If not detected, then prompt user to add to allowlist

    // Check if project config exists in current project root
    if (existsSync(await this.config.getProjectConfigFilepath())) {

      // Check if project root is allowed to be sourced
      if (
        allowlist.isAllowed(this.config, await this.config.getProjectRoot())
      ) {
        const projectConfig = allowlist.getProjectConfig(
          this.config,
          await this.config.getProjectRoot(),
        );

        // Check if sourcing is to be automated
        if (projectConfig.autoload) {
          const contents: string = Deno.readTextFileSync(
            await this.config.getProjectConfigFilepath(),
          );
          const currentHash = hashFileContents(contents);

          // Check if file has been updated
          if (projectConfig.configFileHash !== currentHash) {
            // Prompt user to accept the changes
            // and source the file






          } else {
            // Source the project config file





          }
        }
      } else {
        // Prompt user if they want to add the file to allowlist
        // and source the file
        




      }
    }
  }
}
