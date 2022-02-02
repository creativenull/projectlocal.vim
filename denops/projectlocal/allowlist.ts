import { Config } from "./config.ts";
import { hashFileContents } from "./hasher.ts";

/* Allowlist sample structure:
[
  {
    "projectDirectoryPath": "/path/to/projectdir",
    "configFileHash": "89yu80yh9dy890gbfaewasdf89yb",
    "autoload": true,
    "ignore": false
  },
  {
    "projectDirectoryPath": "/path/to/projectdir2",
    "configFileHash": "89yu80yh9dy890gbfaewasdf89yb",
    "autoload": true,
    "ignore": false
  }
]
*/

export interface AllowlistItem {
  projectDirectoryPath: string;
  configFileHash: string;
  autoload: boolean;
  ignore: boolean;
}

export interface PartialAllowlistItem {
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
export async function addProjectConfigFile(
  config: Config,
  configFile: string,
  ignore?: boolean,
): Promise<void> {
  const fileContents = Deno.readTextFileSync(config.getAllowlistPath());
  let json: AllowlistItem[];
  if (fileContents === "") {
    json = [];
  } else {
    json = JSON.parse(fileContents) as AllowlistItem[];
  }

  const projectDirectoryPath = await config.getProjectRoot();
  const contents = Deno.readTextFileSync(configFile);
  const configFileHash = await hashFileContents(contents);

  json.push({
    projectDirectoryPath,
    configFileHash,
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

  const json = JSON.parse(fileContents) as AllowlistItem[];
  const newJsonContents = json.filter(async (item) =>
    item.projectDirectoryPath !== (await config.getProjectRoot())
  );
  Deno.writeTextFileSync(
    config.getAllowlistPath(),
    JSON.stringify(newJsonContents),
  );
}

/**
 * Update a project dirpath settings from the allowlist
 *
 * @param {Config} config
 * @param {PartialAllowlistItem} newSettings
 * @returns {void}
 */
export async function updateProjectConfigFile(
  config: Config,
  newSettings: PartialAllowlistItem,
): Promise<void> {
  const fileContents = Deno.readTextFileSync(config.getAllowlistPath());
  if (fileContents === "") {
    return;
  }

  const json = JSON.parse(fileContents) as AllowlistItem[];
  const projectRoot = await config.getProjectRoot();
  const ind = json.findIndex((item) =>
    item.projectDirectoryPath === projectRoot
  );

  json[ind] = {
    ...json[ind],
    ...newSettings,
  };

  Deno.writeTextFileSync(config.getAllowlistPath(), JSON.stringify(json));
}

/**
 * Get the project dirpath settings from the allowlist
 *
 * @param {Config} config
 * @param {string} projectpath
 * @returns {void}
 */
export function getProjectConfig(
  config: Config,
  projectpath: string,
): AllowlistItem | null {
  const fileContents = Deno.readTextFileSync(config.getAllowlistPath());
  if (fileContents === "") {
    return null;
  }

  const json = JSON.parse(fileContents) as AllowlistItem[];
  const [project] = json.filter((item) =>
    item.projectDirectoryPath === projectpath
  );
  return project;
}

/**
 * Check if a project dirpath is allowed
 *
 * @param {Config} config
 * @returns {boolean}
 */
export async function isAllowed(config: Config): Promise<boolean> {
  const fileContents = Deno.readTextFileSync(config.getAllowlistPath());
  if (fileContents === "" || fileContents === "[{}]") {
    return false;
  }

  const json = JSON.parse(fileContents) as AllowlistItem[];
  const projectRoot = await config.getProjectRoot();
  const result = json.findIndex((item) =>
    item.projectDirectoryPath === projectRoot
  );
  return result !== -1;
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
