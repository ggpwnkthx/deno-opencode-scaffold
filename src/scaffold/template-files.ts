/**
 * Static template files emitted into a newly initialized application.
 * @module
 */

import type { RenderedFile, TemplateContext } from "@scaffold/types";
import { loadTemplates } from "./template-loader.ts";

export function renderTemplateFiles(
  context: TemplateContext,
): readonly RenderedFile[] {
  return loadTemplates(context);
}
