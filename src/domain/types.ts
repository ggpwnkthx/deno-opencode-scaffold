/**
 * Domain types for the scaffolder CLI.
 * @module
 */

/**
 * Supported CLI commands.
 */
export type CommandName = "init" | "help";

/**
 * Options accepted by the `init` command.
 */
export interface InitCommandOptions {
  readonly appName: string;
  readonly targetDir: string;
  readonly scope: string;
  readonly githubUser: string;
  readonly githubRepo: string;
  readonly codeOwner: string;
  readonly securityEmail: string;
  readonly force: boolean;
  readonly dryRun: boolean;
  readonly includeConfig: boolean;
}

/**
 * A single rendered file in the scaffold output.
 */
export interface RenderedFile {
  readonly path: string;
  readonly content: string;
}

/**
 * Placeholder values used while rendering the template.
 */
export interface TemplateContext {
  readonly appName: string;
  readonly packageName: string;
  readonly scope: string;
  readonly displayPackageName: string;
  readonly githubUser: string;
  readonly githubRepo: string;
  readonly codeOwner: string;
  readonly securityEmail: string;
  readonly generatedAtIso: string;
  readonly currentYear: string;
  readonly includeConfig: boolean;
}
