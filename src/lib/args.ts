/**
 * Lightweight CLI argument parsing with centralized validation.
 * @module
 */

import type { InitCommandOptions } from "../domain/types.ts";
import {
  validateAppName,
  validateCodeOwner,
  validateGithubRepo,
  validateGithubUser,
  validateScope,
  validateSecurityEmail,
  validateTargetDir,
} from "./validation.ts";
import { ValidationError } from "../domain/errors.ts";

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
}

const DEFAULT_SCOPE = "@your-scope";
const DEFAULT_GITHUB_USER = "your-github-user";
const DEFAULT_SECURITY_EMAIL = "security@example.com";
const DEFAULT_CODEOWNER = "@ggpwnkthx";

/**
 * Help text displayed by the CLI.
 */
export const HELP_TEXT = `deno-app-scaffold-cli

Usage:
  scaffold init <app-name> [--dir <path>] [options]
  scaffold help

Options:
  --scope <@scope>             JSR scope used in generated docs
  --github-user <user>         GitHub owner/org used in README badges
  --github-repo <repo>         Repository name used in docs
  --codeowner <@handle>        Value written to .github/CODEOWNERS
  --security-email <email>     Security contact written to SECURITY.md
  --dir <path>                 Custom destination directory
  --force                      Allow writing into a non-empty directory
  --dry-run                    Print planned writes without touching disk
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

function parseFlags(
  args: readonly string[],
): { flags: RawFlags; consumed: Set<number> } {
  const flags: RawFlags = {
    force: false,
    dryRun: false,
    help: false,
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
      default:
        throw new ValidationError(`Unknown flag: ${value}`, { flag: value });
    }
  }

  return { flags, consumed };
}

/**
 * Parses CLI arguments into validated init options.
 */
export function parseInitArgs(args: readonly string[]): InitCommandOptions {
  const { flags, consumed } = parseFlags(args);
  const positionalArgs = args.filter((_, index) => !consumed.has(index));

  if (flags.help) {
    throw new ValidationError(HELP_TEXT);
  }

  const [appNameValue] = positionalArgs;
  if (!appNameValue) {
    throw new ValidationError("Missing required app name.\n\n" + HELP_TEXT);
  }

  const appName = validateAppName(appNameValue);
  const targetDir = validateTargetDir(flags.dir ?? appName);

  return {
    appName,
    targetDir,
    scope: validateScope(flags.scope ?? DEFAULT_SCOPE),
    githubUser: validateGithubUser(flags.githubUser ?? DEFAULT_GITHUB_USER),
    githubRepo: validateGithubRepo(flags.githubRepo ?? appName),
    codeOwner: validateCodeOwner(flags.codeOwner ?? DEFAULT_CODEOWNER),
    securityEmail: validateSecurityEmail(
      flags.securityEmail ?? DEFAULT_SECURITY_EMAIL,
    ),
    force: flags.force,
    dryRun: flags.dryRun,
  };
}

/**
 * True when the incoming command requests help.
 */
export function isHelpCommand(args: readonly string[]): boolean {
  return args.length === 0 || args[0] === "help" || args.includes("--help");
}
