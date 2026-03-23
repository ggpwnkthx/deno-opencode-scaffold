import type { TemplateContext } from "@scaffold/types";

export const metadata = { outputPath: ".vscode/extensions.json" };

export default function (_context: TemplateContext): string {
  return `{
  "recommendations": [
    "justjavac.vscode-deno-extensionpack",
    "vscode-icons-team.vscode-icons"
  ]
}
`;
}
