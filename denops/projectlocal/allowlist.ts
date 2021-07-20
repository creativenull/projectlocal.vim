import { Config } from "./config.ts";
import { hashFileContents } from "./hasher.ts";

export interface AllowedProject {
  projectDirectoryPath: string;
  configFileHash: string;
  autoload: boolean;
}

export interface PartialAllowedProject {
  projectDirectoryPath?: string;
  configFileHash?: string;
  autoload?: boolean;
}

export function addProjectConfigFile(
  config: Config,
  projectpath: string,
): void {
  const fileContents = Deno.readTextFileSync(config.getAllowlistPath());
  const json = JSON.parse(fileContents) as AllowedProject[];

  json.push({
    projectDirectoryPath: projectpath,
    configFileHash: hashFileContents(fileContents),
    autoload: true,
  });

  Deno.writeTextFileSync(config.getAllowlistPath(), JSON.stringify(json));
}

export function removeProjectConfigFile(
  config: Config,
  projectpath: string,
): void {
  const fileContents = Deno.readTextFileSync(config.getAllowlistPath());
  const json = JSON.parse(fileContents) as AllowedProject[];

  const newJsonContents = json.filter((item) =>
    item.projectDirectoryPath !== projectpath
  );

  Deno.writeTextFileSync(
    config.getAllowlistPath(),
    JSON.stringify(newJsonContents),
  );
}

export function updateProjectConfigFile(
  config: Config,
  projectpath: string,
  newSettings: PartialAllowedProject,
): void {
  const fileContents = Deno.readTextFileSync(config.getAllowlistPath());
  const json = JSON.parse(fileContents) as AllowedProject[];

  const newJsonContents = json.map((item) => {
    if (item.projectDirectoryPath === projectpath) {
      return {
        ...item,
        ...newSettings,
      };
    }

    return item;
  });

  Deno.writeTextFileSync(
    config.getAllowlistPath(),
    JSON.stringify(newJsonContents),
  );
}

export function getProjectConfig(config: Config, projectpath: string): AllowedProject {
  const fileContents = Deno.readTextFileSync(config.getAllowlistPath());
  const json = JSON.parse(fileContents) as AllowedProject[];
  const [project] = json.filter(item => item.projectDirectoryPath === projectpath)
  return project
}

export function isAllowed(config: Config, projectpath: string): boolean {
  const fileContents = Deno.readTextFileSync(config.getAllowlistPath());
  const json = JSON.parse(fileContents) as AllowedProject[];

  const res = json.filter((item) => item.projectDirectoryPath === projectpath);
  if (res.length === 1) {
    return true;
  }

  return false;
}

export function autoloadDisable(config: Config, projectpath: string) {
  updateProjectConfigFile(config, projectpath, { autoload: false });
}

export function autoloadEnable(config: Config, projectpath: string) {
  updateProjectConfigFile(config, projectpath, { autoload: true });
}
