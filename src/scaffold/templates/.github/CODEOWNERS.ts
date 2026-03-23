import type { TemplateContext } from "@scaffold/types";

export const metadata = { outputPath: ".github/CODEOWNERS" };

export default function (context: TemplateContext): string {
  return `# Code ownership
# Add your GitHub username or team handle here
* ${context.codeOwner}
`;
}
