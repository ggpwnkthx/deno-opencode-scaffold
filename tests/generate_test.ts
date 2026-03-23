import { assert, assertEquals, assertStringIncludes } from "jsr:@std/assert@1.0.19";

import { initializeApp } from "../src/mod.ts";

Deno.test("initializeApp writes the required files and directories", async () => {
  const tempDirectory = await Deno.makeTempDir();

  const result = await initializeApp({
    appName: "demo-app",
    targetDir: `${tempDirectory}/demo-app`,
    scope: "@acme",
    githubUser: "acme",
    githubRepo: "demo-app",
    codeOwner: "@acme/platform",
    securityEmail: "security@acme.test",
    force: false,
    dryRun: false,
  });

  assert(result.files.length >= 20);

  const requiredPaths = [
    ".devcontainer/devcontainer.json",
    ".devcontainer/Dockerfile",
    ".github/workflows/ci.yml",
    ".github/CODEOWNERS",
    ".github/dependabot.yml",
    ".opencode/plugins/deno-guards.ts",
    ".vscode/settings.json",
    ".gitattributes",
    ".gitignore",
    "AGENTS.md",
    "CHANGELOG.md",
    "CONTRIBUTING.md",
    "CONVENTIONAL_COMMITS.md",
    "LICENSE.md",
    "README.md",
    "SECURITY.md",
    "opencode.json",
    "deno.jsonc",
  ];

  for (const relativePath of requiredPaths) {
    const absolutePath = `${result.targetDir}/${relativePath}`;
    const stat = await Deno.stat(absolutePath);
    assert(stat.isFile, `${relativePath} should be written`);
  }
});

Deno.test("initializeApp renders README and deno.jsonc using input values", async () => {
  const tempDirectory = await Deno.makeTempDir();

  await initializeApp({
    appName: "widget-kit",
    targetDir: `${tempDirectory}/widget-kit`,
    scope: "@widgets",
    githubUser: "widget-co",
    githubRepo: "widget-kit",
    codeOwner: "@widget-co/platform",
    securityEmail: "security@widgets.test",
    force: false,
    dryRun: false,
  });

  const readme = await Deno.readTextFile(`${tempDirectory}/widget-kit/README.md`);
  assertStringIncludes(readme, "# @widgets/widget-kit");
  assertStringIncludes(
    readme,
    "https://github.com/widget-co/widget-kit/actions/workflows/ci.yml",
  );

  const denoJsonc = await Deno.readTextFile(`${tempDirectory}/widget-kit/deno.jsonc`);
  assertStringIncludes(denoJsonc, '"exports": {');
  assertStringIncludes(denoJsonc, "./src/mod.ts");
});

Deno.test("initializeApp dry-run reports files without writing", async () => {
  const tempDirectory = await Deno.makeTempDir();
  const targetDir = `${tempDirectory}/dry-run-app`;

  const result = await initializeApp({
    appName: "dry-run-app",
    targetDir,
    scope: "@demo",
    githubUser: "demo-user",
    githubRepo: "dry-run-app",
    codeOwner: "@demo-user",
    securityEmail: "security@demo.test",
    force: false,
    dryRun: true,
  });

  assertEquals(result.dryRun, true);
  assert(result.files.length > 0);

  let targetExists = true;
  try {
    await Deno.stat(targetDir);
  } catch (error: unknown) {
    if (error instanceof Deno.errors.NotFound) {
      targetExists = false;
    } else {
      throw error;
    }
  }

  assertEquals(targetExists, false);
});
