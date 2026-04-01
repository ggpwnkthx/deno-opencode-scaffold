/**
 * Scaffold generation entry points.
 * @module
 */

import type {
  InitCommandOptions,
  RenderedFile,
  TemplateContext,
} from "@scaffold/types";
import { joinFsPath } from "../lib/path.ts";
import { ensureWritableTarget, writeTextFile } from "../lib/fs.ts";
import { loadTemplates } from "./template-registry.ts";

/**
 * Summary of a scaffold operation.
 */
export interface ScaffoldResult {
  readonly targetDir: string;
  readonly files: readonly string[];
  readonly dryRun: boolean;
}

/**
 * Creates the template rendering context.
 */
export function createTemplateContext(
  options: InitCommandOptions,
): TemplateContext {
  const generatedAtIso = new Date().toISOString();
  return {
    appName: options.appName,
    packageName: options.appName,
    scope: options.scope,
    displayPackageName: `${options.scope}/${options.appName}`,
    githubUser: options.githubUser,
    githubRepo: options.githubRepo,
    codeOwner: options.codeOwner,
    securityEmail: options.securityEmail,
    generatedAtIso,
    currentYear: new Date(generatedAtIso).getUTCFullYear().toString(),
    includeConfig: options.includeConfig,
  };
}

/**
 * Returns all rendered files for a scaffold request.
 */
export async function buildRenderedFiles(
  options: InitCommandOptions,
): Promise<readonly RenderedFile[]> {
  const context = createTemplateContext(options);
  return await loadTemplates(context);
}

/**
 * Initializes a new application scaffold on disk.
 */
export async function initializeApp(
  options: InitCommandOptions,
): Promise<ScaffoldResult> {
  const renderedFiles = await buildRenderedFiles(options);

  if (!options.dryRun) {
    await ensureWritableTarget(options.targetDir, options.force);
  }

  const writtenPaths: string[] = [];

  for (const renderedFile of renderedFiles) {
    const absolutePath = joinFsPath(options.targetDir, renderedFile.path);

    if (!options.dryRun) {
      await writeTextFile(absolutePath, renderedFile.content);
    }

    writtenPaths.push(absolutePath);
  }

  return {
    targetDir: options.targetDir,
    files: writtenPaths,
    dryRun: options.dryRun,
  };
}
