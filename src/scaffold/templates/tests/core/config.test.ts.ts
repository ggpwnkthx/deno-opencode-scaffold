import type { TemplateContext } from "@scaffold/types";

export const metadata = {
  outputPath: "tests/core/config.test.ts",
  conditional: "config",
};

export default function (context: TemplateContext): string {
  return `import {
  assertEquals,
  assertThrows,
} from "jsr:@std/assert@1.0.19";

import { createConfig } from "../../src/mod.ts";

Deno.test("createConfig returns a config for valid input", () => {
  assertEquals(createConfig("${context.packageName}", "1.0.0"), {
    name: "${context.packageName}",
    version: "1.0.0",
  });
});

Deno.test("createConfig rejects an empty name", () => {
  assertThrows(() => createConfig("   ", "1.0.0"), Error, "Name cannot be empty");
});

Deno.test("createConfig rejects a non-semver version", () => {
  assertThrows(
    () => createConfig("${context.packageName}", "one"),
    Error,
    "Version must be in semver format",
  );
});
`;
}
