import { assert, assertEquals, assertStringIncludes } from "jsr:@std/assert@1.0.19";

import { initializeApp } from "../src/mod.ts";
import { parseInitArgs } from "../src/lib/args.ts";

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
    includeConfig: true,
  });

  assert(result.files.length >= 20);

  const requiredPaths = [
    ".devcontainer/devcontainer.json",
    ".devcontainer/Dockerfile",
    ".github/workflows/ci.yml",
    ".github/CODEOWNERS",
    ".github/dependabot.yml",
    ".opencode/plugins/deno-guards.ts",
    ".opencode/plugins/code-grade.ts",
    ".opencode/settings.json",
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
    includeConfig: true,
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
    includeConfig: true,
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

Deno.test("initializeApp with targetDir '.' writes files to current directory", async () => {
  const tempDirectory = await Deno.makeTempDir();
  const originalCwd = Deno.cwd();

  try {
    Deno.chdir(tempDirectory);

    const result = await initializeApp({
      appName: "current-dir-app",
      targetDir: ".",
      scope: "@test",
      githubUser: "test-user",
      githubRepo: "current-dir-app",
      codeOwner: "@test/team",
      securityEmail: "security@test.example",
      force: false,
      dryRun: false,
      includeConfig: true,
    });

    assertEquals(result.targetDir, ".");
    assert(result.files.length >= 20);

    const readmeStat = await Deno.stat("README.md");
    assert(readmeStat.isFile, "README.md should exist in current directory");
  } finally {
    Deno.chdir(originalCwd);
  }
});

Deno.test("parseInitArgs derives app name from current directory when not provided", () => {
  const originalCwd = Deno.cwd();

  try {
    Deno.chdir("/tmp");
    const options = parseInitArgs([]);
    assertEquals(options.targetDir, ".");
    assertEquals(options.appName, "tmp");
  } finally {
    Deno.chdir(originalCwd);
  }
});

Deno.test("parseInitArgs uses '.' as explicit current directory", () => {
  const originalCwd = Deno.cwd();

  try {
    Deno.chdir("/tmp");
    const options = parseInitArgs(["."]);
    assertEquals(options.targetDir, ".");
    assertEquals(options.appName, "tmp");
  } finally {
    Deno.chdir(originalCwd);
  }
});

Deno.test("parseInitArgs normalizes underscores to hyphens in app names", () => {
  const originalCwd = Deno.cwd();

  try {
    Deno.chdir("/tmp");
    const options = parseInitArgs(["my_underscore_app"]);
    assertEquals(options.appName, "my-underscore-app");
  } finally {
    Deno.chdir(originalCwd);
  }
});

Deno.test("parseInitArgs defaults includeConfig to true", () => {
  const options = parseInitArgs(["my-app"]);
  assertEquals(options.includeConfig, true);
});

Deno.test("parseInitArgs sets includeConfig to false when --no-config is passed", () => {
  const options = parseInitArgs(["my-app", "--no-config"]);
  assertEquals(options.includeConfig, false);
});

Deno.test("initializeApp with includeConfig false skips config files", async () => {
  const tempDirectory = await Deno.makeTempDir();

  const result = await initializeApp({
    appName: "no-config-app",
    targetDir: `${tempDirectory}/no-config-app`,
    scope: "@test",
    githubUser: "test-user",
    githubRepo: "no-config-app",
    codeOwner: "@test/team",
    securityEmail: "security@test.example",
    force: false,
    dryRun: false,
    includeConfig: false,
  });

  const writtenPaths = result.files.map((f) => f.replace(/^.*\//, ""));

  assert(
    !writtenPaths.includes("config.ts"),
    "src/core/config.ts should not be generated",
  );
  assert(
    !writtenPaths.includes("config.test.ts"),
    "tests/core/config.test.ts should not be generated",
  );
  assert(
    !writtenPaths.includes("config.bench.ts"),
    "benchmarks/config.bench.ts should not be generated",
  );
});

Deno.test("initializeApp with includeConfig false generates src/mod.ts without config exports", async () => {
  const tempDirectory = await Deno.makeTempDir();

  await initializeApp({
    appName: "no-config-app",
    targetDir: `${tempDirectory}/no-config-app`,
    scope: "@test",
    githubUser: "test-user",
    githubRepo: "no-config-app",
    codeOwner: "@test/team",
    securityEmail: "security@test.example",
    force: false,
    dryRun: false,
    includeConfig: false,
  });

  const modTs = await Deno.readTextFile(`${tempDirectory}/no-config-app/src/mod.ts`);
  assertStringIncludes(modTs, "// Config utilities were not generated");
  assertStringIncludes(modTs, "@module");
});

Deno.test("initializeApp with includeConfig false generates deno.jsonc without config tasks", async () => {
  const tempDirectory = await Deno.makeTempDir();

  await initializeApp({
    appName: "no-config-app",
    targetDir: `${tempDirectory}/no-config-app`,
    scope: "@test",
    githubUser: "test-user",
    githubRepo: "no-config-app",
    codeOwner: "@test/team",
    securityEmail: "security@test.example",
    force: false,
    dryRun: false,
    includeConfig: false,
  });

  const denoJsonc = await Deno.readTextFile(
    `${tempDirectory}/no-config-app/deno.jsonc`,
  );
  assertStringIncludes(denoJsonc, '"fmt"');
  assertStringIncludes(denoJsonc, '"lint"');
  assertStringIncludes(denoJsonc, '"check"');
  assertStringIncludes(denoJsonc, '"ci"');
  assert(!denoJsonc.includes('"test"'), "test task should not be generated");
  assert(!denoJsonc.includes('"bench"'), "bench task should not be generated");
});

Deno.test("initializeApp with includeConfig false generates fewer files than with includeConfig true", async () => {
  const tempDirectory = await Deno.makeTempDir();

  const withConfig = await initializeApp({
    appName: "with-config",
    targetDir: `${tempDirectory}/with-config`,
    scope: "@test",
    githubUser: "test-user",
    githubRepo: "with-config",
    codeOwner: "@test/team",
    securityEmail: "security@test.example",
    force: false,
    dryRun: false,
    includeConfig: true,
  });

  const withoutConfig = await initializeApp({
    appName: "without-config",
    targetDir: `${tempDirectory}/without-config`,
    scope: "@test",
    githubUser: "test-user",
    githubRepo: "without-config",
    codeOwner: "@test/team",
    securityEmail: "security@test.example",
    force: false,
    dryRun: false,
    includeConfig: false,
  });

  assert(
    withConfig.files.length > withoutConfig.files.length,
    "includeConfig:true should generate more files than includeConfig:false",
  );
  assertEquals(
    withConfig.files.length - withoutConfig.files.length,
    3,
    "difference should be exactly 3 (config.ts, config.test.ts, config.bench.ts)",
  );
});
