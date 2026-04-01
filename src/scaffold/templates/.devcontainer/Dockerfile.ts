import type { TemplateContext } from "@scaffold/types";

export const metadata = { outputPath: ".devcontainer/Dockerfile" };

export default function (_context: TemplateContext): string {
  return `# Stage 1: Get Deno binary
FROM denoland/deno:bin AS deno
# Stage 2: Main development environment
FROM mcr.microsoft.com/devcontainers/base:debian
# Copy Deno binary from Stage 1
COPY --from=deno /deno /usr/local/bin/deno

USER vscode
ENV OPENCODE_CONFIG=.opencode/settings.json
RUN curl -fsSL https://opencode.ai/install | bash
`;
}
