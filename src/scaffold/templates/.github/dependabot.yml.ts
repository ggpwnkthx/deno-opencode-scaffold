import type { TemplateContext } from "@scaffold/types";

export const metadata = { outputPath: ".github/dependabot.yml" };

export default function (_context: TemplateContext): string {
  return `version: 2
updates:
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    labels:
      - "dependencies"
      - "automated"

  - package-ecosystem: "deno"
    directory: "/"
    schedule:
      interval: "weekly"
    labels:
      - "dependencies"
      - "automated"
    ignore:
      - dependency-name: "*"
        update-types: ["version-update:semver-major"]
`;
}
