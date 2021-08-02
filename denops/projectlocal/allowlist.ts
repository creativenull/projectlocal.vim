import { Config } from "./config.ts";
import { hashFileContents } from "./hasher.ts";

export interface AllowedProject {
  projectDirectoryPath: string;
  configFileHash: string;
  autoload: boolean;
  ignore: boolean;
}

export interface PartialAllowedProject {
  projectDirectoryPath?: string;
  configFileHash?: string;
  autoload?: boolean;
  ignore?: boolean;
}

/**
 * Add a project dirpath to the allowlist
 *
 * @param {Config} config
 * @param {boolean} ignore Ignore the project dirpath on the next vim startup
 * @returns {Promise<void>}
 */
export async function addProjectConfigFile(config: Config, ignore?: boolean): Promise<void> {
  const fileContents = Deno.readTextFileSync(config.getAllowlistPath());
  let json: AllowedProject[];
  if (fileContents === "") {
    json = [];
  } else {
    json = JSON.parse(fileContents) as AllowedProject[];
  }

  json.push({
    projectDirectoryPath: await config.getProjectRoot(),
    configFileHash: hashFileContents(Deno.readTextFileSync(await config.getProjectConfigFilepath())),
    autoload: true,
    ignore: ignore ?? false,
  });

  Deno.writeTextFileSync(config.getAllowlistPath(), JSON.stringify(json));
}

/**
 * Remove a project dirpath from the allowlist
 *
 * @param {Config} config
 * @returns {void}
 */
export function removeProjectConfigFile(config: Config): void {
  const fileContents = Deno.readTextFileSync(config.getAllowlistPath());
  if (fileContents === "") {
    return;
  }

  const json = JSON.parse(fileContents) as AllowedProject[];
  const newJsonContents = json.filter(async (item) => item.projectDirectoryPath !== (await config.getProjectRoot()));
  Deno.writeTextFileSync(config.getAllowlistPath(), JSON.stringify(newJsonContents));
}

/**
 * Update a project dirpath settings from the allowlist
 *
 * @param {Config} config
 * @param {PartialAllowedProject} newSettings
 * @returns {void}
 */
export async function updateProjectConfigFile(config: Config, newSettings: PartialAllowedProject): Promise<void> {
  const fileContents = Deno.readTextFileSync(config.getAllowlistPath());
  if (fileContents === "") {
    return;
  }

  const json = JSON.parse(fileContents) as AllowedProject[];
  const projectRoot = await config.getProjectRoot();
  const ind = json.findIndex((item) => item.projectDirectoryPath === projectRoot);

  json[ind] = {
    ...json[ind],
    ...newSettings,
  };

  /* const newJsonContents = json.map(async (item) => {
    if (item.projectDirectoryPath === (await config.getProjectRoot())) {
      return {
        ...item,
        ...newSettings,
      };
    }

    return item;
  }); */

  Deno.writeTextFileSync(config.getAllowlistPath(), JSON.stringify(json));
}

/**
 * Get the project dirpath settings from the allowlist
 *
 * @param {Config} config
 * @param {string} projectpath
 * @returns {void}
 */
export function getProjectConfig(config: Config, projectpath: string): AllowedProject | null {
  const fileContents = Deno.readTextFileSync(config.getAllowlistPath());
  if (fileContents === "") {
    return null;
  }

  const json = JSON.parse(fileContents) as AllowedProject[];
  const [project] = json.filter((item) => item.projectDirectoryPath === projectpath);
  return project;
}

/**
 * Check if a project dirpath is allowed
 *
 * @param {Config} config
 * @returns {boolean}
 */
export function isAllowed(config: Config): boolean {
  const fileContents = Deno.readTextFileSync(config.getAllowlistPath());
  if (fileContents === "") {
    return false;
  }

  const json = JSON.parse(fileContents) as AllowedProject[];
  const res = json.filter(
    async (item) => item.projectDirectoryPath === (await config.getProjectRoot()) && !item.ignore,
  );
  if (res.length === 1) {
    return true;
  }

  return false;
}

/**
 * Disable autoload on a local project config
 *
 * @param {Config} config
 * @returns {void}
 */
export function autoloadDisable(config: Config): void {
  updateProjectConfigFile(config, { autoload: false });
}

/**
 * Enable autoload on a local project config
 *
 * @param {Config} config
 * @returns {void}
 */
export function autoloadEnable(config: Config): void {
  updateProjectConfigFile(config, { autoload: true });
}
