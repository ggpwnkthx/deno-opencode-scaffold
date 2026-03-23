import type { TemplateContext } from "@scaffold/types";

export const metadata = { outputPath: ".gitignore" };

export default function (_context: TemplateContext): string {
  return `# Environment
.env
.env.local
.env.*.local

# IDE
.idea/
.vscode/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Coverage
coverage/

# Build output
dist/
build/

# Temp files
tmp/
temp/
*.tmp

# Misc
CLAUDE.md
`;
}
