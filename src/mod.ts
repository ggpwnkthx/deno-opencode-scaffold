/**
 * Public API for the scaffolder.
 * @module
 */

export type {
  InitCommandOptions,
  RenderedFile,
  TemplateContext,
} from "./domain/types.ts";
export {
  buildRenderedFiles,
  createTemplateContext,
  initializeApp,
  type ScaffoldResult,
} from "./scaffold/generate.ts";
