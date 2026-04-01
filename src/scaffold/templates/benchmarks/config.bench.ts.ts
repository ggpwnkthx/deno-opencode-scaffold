import type { TemplateContext } from "@scaffold/types";

export const metadata = {
  outputPath: "benchmarks/config.bench.ts",
  conditional: "config",
};

export default function (_context: TemplateContext): string {
  return `import { createConfig } from "../src/mod.ts";

Deno.bench("createConfig", () => {
  createConfig("bench-app", "1.0.0");
});
`;
}
