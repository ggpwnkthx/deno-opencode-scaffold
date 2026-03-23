/**
 * Template loading and discovery.
 * @module
 */

import type { RenderedFile, TemplateContext } from "@scaffold/types";
import { loadTemplates as loadTemplatesFromRegistry } from "./template-registry.ts";

export { templatePaths } from "./template-registry.ts";

export function loadTemplates(
  context: TemplateContext,
): readonly RenderedFile[] {
  return loadTemplatesFromRegistry(context);
}
