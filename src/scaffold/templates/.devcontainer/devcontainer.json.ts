import type { TemplateContext } from "@scaffold/types";

export const metadata = { outputPath: ".devcontainer/devcontainer.json" };

export default function (_context: TemplateContext): string {
  return `{
  "name": "base-deno",
  "build": {
    "dockerfile": "Dockerfile"
  },
  "initializeCommand": "sh -c 'ENVFILE=\\"\${localWorkspaceFolder}/.env\\"; if [ ! -f \\"$ENVFILE\\" ]; then umask 000; : > \\"$ENVFILE\\"; chmod 666 \\"$ENVFILE\\"; fi'",
  "runArgs": [
    "--env-file",
    "\${localWorkspaceFolder}/.env"
  ],
  "customizations": {
    "vscode": {
      "extensions": [
        "justjavac.vscode-deno-extensionpack",
        "vscode-icons-team.vscode-icons"
      ]
    }
  },
  "features": {
    "ghcr.io/devcontainers/features/git:1": {},
    "ghcr.io/devcontainers/features/github-cli:1": {}
  }
}
`;
}
