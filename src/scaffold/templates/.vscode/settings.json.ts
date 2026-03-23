import type { TemplateContext } from "@scaffold/types";

export const metadata = { outputPath: ".vscode/settings.json" };

export default function (_context: TemplateContext): string {
  return `{
  "deno.enable": true,
  "deno.lint": true,
  "editor.formatOnSave": true,
  "files.insertFinalNewline": true
}
`;
}
