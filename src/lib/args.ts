/**
 * Lightweight CLI argument parsing with centralized validation.
 * @module
 */

import type { InitCommandOptions } from "@scaffold/types";
import {
  validateAppName,
  validateCodeOwner,
  validateGithubRepo,
  validateGithubUser,
  validateScope,
  validateSecurityEmail,
  validateTargetDir,
} from "./validation.ts";
import { basename } from "./path.ts";
import { ValidationError } from "../domain/errors.ts";
import { promptWithValidation } from "./prompt.ts";

// === Prompt provider ===

export interface PromptProvider {
  scope: (defaultValue: string) => Promise<string>;
  githubUser: (defaultValue: string) => Promise<string>;
  githubRepo: (defaultValue: string) => Promise<string>;
  codeOwner: (defaultValue: string) => Promise<string>;
  securityEmail: (defaultValue: string) => Promise<string>;
}

export function createInteractivePromptProvider(): PromptProvider {
  return {
    scope: (defaultValue) =>
      promptWithValidation(
        "Enter your JSR scope (e.g., @my-scope)",
        validateScope,
        defaultValue,
      ),
    githubUser: (defaultValue) =>
      promptWithValidation(
        "Enter your GitHub username or organization",
        validateGithubUser,
        defaultValue,
      ),
    githubRepo: (defaultValue) =>
      promptWithValidation(
        "Enter the repository name",
        validateGithubRepo,
        defaultValue,
      ),
    codeOwner: (defaultValue) =>
      promptWithValidation(
        "Enter the CODEOWNERS handle (e.g., @user or @org/team)",
        validateCodeOwner,
        defaultValue,
      ),
    securityEmail: (defaultValue) =>
      promptWithValidation(
        "Enter the security contact email",
        validateSecurityEmail,
        defaultValue,
      ),
  };
}

// === Flag parsing ===

interface RawFlags {
  dir?: string;
  scope?: string;
  githubUser?: string;
  githubRepo?: string;
  codeOwner?: string;
  securityEmail?: string;
  force: boolean;
  dryRun: boolean;
  help: boolean;
  noConfig: boolean;
}

/**
 * Help text displayed by the CLI.
 */
export const HELP_TEXT = `deno-app-scaffold-cli

Usage:
  scaffold init [app-name] [--dir <path>] [options]
  scaffold help

Description:
  Initialize a new Deno project. If app-name is omitted, uses the current
  directory name. Use "." to explicitly initialize in the current directory.

Options:
  --scope <@scope>             JSR scope used in generated docs
  --github-user <user>         GitHub owner/org used in README badges
  --github-repo <repo>         Repository name used in docs
  --codeowner <@handle>        Value written to .github/CODEOWNERS
  --security-email <email>     Security contact written to SECURITY.md
  --dir <path>                 Custom destination directory
  --force                      Allow writing into a non-empty directory
  --dry-run                    Print planned writes without touching disk
  --no-config                  Skip generating config utilities (src/core/config.ts, tests, benchmarks)
  --help                       Show this help text

Permissions:
  --allow-read
  --allow-write`;

function consumeFlagValue(
  args: readonly string[],
  index: number,
  name: string,
): string {
  const value = args[index + 1];
  if (!value || value.startsWith("--")) {
    throw new ValidationError(`Missing value for ${name}.`, { flag: name });
  }
  return value;
}

export function parseFlags(
  args: readonly string[],
): { flags: RawFlags; consumed: Set<number> } {
  const flags: RawFlags = {
    force: false,
    dryRun: false,
    help: false,
    noConfig: false,
  };
  const consumed = new Set<number>();

  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];
    if (!value.startsWith("--")) {
      continue;
    }

    consumed.add(index);

    switch (value) {
      case "--dir":
        flags.dir = consumeFlagValue(args, index, value);
        consumed.add(index + 1);
        break;
      case "--scope":
        flags.scope = consumeFlagValue(args, index, value);
        consumed.add(index + 1);
        break;
      case "--github-user":
        flags.githubUser = consumeFlagValue(args, index, value);
        consumed.add(index + 1);
        break;
      case "--github-repo":
        flags.githubRepo = consumeFlagValue(args, index, value);
        consumed.add(index + 1);
        break;
      case "--codeowner":
        flags.codeOwner = consumeFlagValue(args, index, value);
        consumed.add(index + 1);
        break;
      case "--security-email":
        flags.securityEmail = consumeFlagValue(args, index, value);
        consumed.add(index + 1);
        break;
      case "--force":
        flags.force = true;
        break;
      case "--dry-run":
        flags.dryRun = true;
        break;
      case "--help":
        flags.help = true;
        break;
      case "--no-config":
        flags.noConfig = true;
        break;
      default:
        throw new ValidationError(`Unknown flag: ${value}`, { flag: value });
    }
  }

  return { flags, consumed };
}

// === Argument resolution ===

type FlagExampleKey = keyof PromptProvider;

const EXAMPLES: Record<FlagExampleKey, string> = {
  scope: "--scope @my-scope",
  githubUser: "--github-user myuser",
  githubRepo: "--github-repo my-repo",
  codeOwner: "--codeowner @myuser",
  securityEmail: "--security-email security@example.com",
} as const;

async function resolveArg(
  flagName: FlagExampleKey,
  flagValue: string | undefined,
  promptFn: (() => Promise<string>) | undefined,
): Promise<string> {
  if (flagValue !== undefined) {
    return flagValue;
  }
  if (promptFn) {
    return await promptFn();
  }
  throw new ValidationError(
    `Missing --${flagName}. Provide via flag (${
      EXAMPLES[flagName]
    }) or run in an interactive terminal.`,
    { flag: flagName },
  );
}

/**
 * Parses CLI arguments into validated init options.
 * When not running interactively or when promptProvider is undefined,
 * missing values will cause an error instead of prompting.
 */
export async function parseInitArgs(
  args: readonly string[],
  promptProvider?: PromptProvider,
): Promise<InitCommandOptions> {
  const { flags, consumed } = parseFlags(args);
  const positionalArgs = args.filter((_, index) => !consumed.has(index));

  if (flags.help) {
    throw new ValidationError(HELP_TEXT);
  }

  const [appNameValue] = positionalArgs;
  let appName: string;
  if (appNameValue === undefined || appNameValue === ".") {
    appName = basename(Deno.cwd());
  } else {
    appName = validateAppName(appNameValue);
  }
  const targetDir = validateTargetDir(flags.dir ?? ".");

  const scope = await resolveArg(
    "scope",
    flags.scope,
    promptProvider ? () => promptProvider.scope("@your-scope") : undefined,
  );

  const githubUser = await resolveArg(
    "githubUser",
    flags.githubUser,
    promptProvider ? () => promptProvider.githubUser("your-github-user") : undefined,
  );

  const githubRepo = await resolveArg(
    "githubRepo",
    flags.githubRepo,
    promptProvider ? () => promptProvider.githubRepo(appName) : undefined,
  );

  const codeOwner = await resolveArg(
    "codeOwner",
    flags.codeOwner,
    promptProvider ? () => promptProvider.codeOwner("@ggpwnkthx") : undefined,
  );

  const securityEmail = await resolveArg(
    "securityEmail",
    flags.securityEmail,
    promptProvider
      ? () => promptProvider.securityEmail("security@example.com")
      : undefined,
  );

  return {
    appName,
    targetDir,
    scope,
    githubUser,
    githubRepo,
    codeOwner,
    securityEmail,
    force: flags.force,
    dryRun: flags.dryRun,
    includeConfig: !flags.noConfig,
  };
}

/**
 * True when the incoming command requests help.
 */
export function isHelpCommand(args: readonly string[]): boolean {
  return args.length === 0 || args[0] === "help" || args.includes("--help");
}
