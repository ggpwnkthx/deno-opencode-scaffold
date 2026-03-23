import type { TemplateContext } from "@scaffold/types";

export const metadata = { outputPath: "examples/basic.ts" };

export default function (context: TemplateContext): string {
  return `import { createConfig } from "../src/mod.ts";

const config = createConfig("${context.packageName}", "1.0.0");
console.log(config);
`;
}
