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

export async function addProjectConfigFile(config: Config, ignore?: boolean): Promise<void> {
  const fileContents = Deno.readTextFileSync(config.getAllowlistPath());
  let json: AllowedProject[];
  if (fileContents === "") {
    json = []
  } else {
    json = JSON.parse(fileContents) as AllowedProject[];
  }

  json.push({
    projectDirectoryPath: await config.getProjectRoot(),
    configFileHash: hashFileContents(fileContents),
    autoload: true,
    ignore: ignore ?? false,
  });

  Deno.writeTextFileSync(config.getAllowlistPath(), JSON.stringify(json));
}

export function removeProjectConfigFile(config: Config): void {
  const fileContents = Deno.readTextFileSync(config.getAllowlistPath());
  if (fileContents === "") {
    return;
  }

  const json = JSON.parse(fileContents) as AllowedProject[];
  const newJsonContents = json.filter(async (item) => item.projectDirectoryPath !== await config.getProjectRoot());
  Deno.writeTextFileSync(config.getAllowlistPath(), JSON.stringify(newJsonContents));
}

export function updateProjectConfigFile(config: Config, newSettings: PartialAllowedProject): void {
  const fileContents = Deno.readTextFileSync(config.getAllowlistPath());
  if (fileContents === "") {
    return;
  }

  const json = JSON.parse(fileContents) as AllowedProject[];

  const newJsonContents = json.map(async (item) => {
    if (item.projectDirectoryPath === await config.getProjectRoot()) {
      return {
        ...item,
        ...newSettings,
      };
    }

    return item;
  });

  Deno.writeTextFileSync(config.getAllowlistPath(), JSON.stringify(newJsonContents));
}

export function getProjectConfig(config: Config, projectpath: string): AllowedProject | null {
  const fileContents = Deno.readTextFileSync(config.getAllowlistPath());
  if (fileContents === "") {
    return null;
  }

  const json = JSON.parse(fileContents) as AllowedProject[];
  const [project] = json.filter(item => item.projectDirectoryPath === projectpath)
  return project
}

export function isAllowed(config: Config): boolean {
  const fileContents = Deno.readTextFileSync(config.getAllowlistPath());
  if (fileContents === "") {
    return false;
  }

  const json = JSON.parse(fileContents) as AllowedProject[];
  const res = json.filter(async (item) => item.projectDirectoryPath === await config.getProjectRoot() && !item.ignore);
  if (res.length === 1) {
    return true;
  }

  return false;
}

export function autoloadDisable(config: Config) {
  updateProjectConfigFile(config, { autoload: false });
}

export function autoloadEnable(config: Config) {
  updateProjectConfigFile(config, { autoload: true });
}
