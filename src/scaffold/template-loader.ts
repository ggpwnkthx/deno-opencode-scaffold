/**
 * Template loading and discovery.
 * @module
 */

import type { RenderedFile, TemplateContext } from "@scaffold/types";

interface TemplateModule {
  metadata: { outputPath: string };
  default: (context: TemplateContext) => string;
}

async function getTemplateFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  for await (const entry of Deno.readDir(dir)) {
    const fullPath = `${dir}/${entry.name}`;
    if (entry.isDirectory) {
      files.push(...await getTemplateFiles(fullPath));
    } else if (entry.isFile && entry.name.endsWith(".ts")) {
      files.push(fullPath);
    }
  }
  return files;
}

export async function loadTemplates(
  context: TemplateContext,
): Promise<readonly RenderedFile[]> {
  const templateDir = new URL(".", import.meta.url).pathname + "templates";
  const templateFiles = await getTemplateFiles(templateDir);

  const renderedFiles: RenderedFile[] = [];

  for (const filePath of templateFiles) {
    const module = await import(`file://${filePath}`) as TemplateModule;
    const content = module.default(context);
    renderedFiles.push({
      path: module.metadata.outputPath,
      content,
    });
  }

  return renderedFiles;
}
