import type { TemplateContext } from "@scaffold/types";

export const metadata = { outputPath: ".gitattributes" };

export default function (_context: TemplateContext): string {
  return `# Auto detect text files and perform LF normalization
* text=auto

# Source files
*.ts text diff=typescript

# Documentation
*.md text

# Configuration
*.json text
*.yml text
*.yaml text

# Scripts
*.sh text eol=lf

# Denote all shell files have shell syntax
*.sh text eol=lf
`;
}
