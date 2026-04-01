import { assert, assertEquals, assertStringIncludes } from "jsr:@std/assert@1.0.19";

import { initializeApp } from "../src/mod.ts";
import { parseFlags, parseInitArgs } from "../src/lib/args.ts";
import { ValidationError } from "../src/domain/errors.ts";

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

Deno.test("parseInitArgs derives app name from current directory when not provided", async () => {
  const originalCwd = Deno.cwd();

  try {
    Deno.chdir("/tmp");
    const options = await parseInitArgs(
      [
        "--scope",
        "@test",
        "--github-user",
        "testuser",
        "--github-repo",
        "test-repo",
        "--codeowner",
        "@test",
        "--security-email",
        "test@example.com",
      ],
    );
    assertEquals(options.targetDir, ".");
    assertEquals(options.appName, "tmp");
  } finally {
    Deno.chdir(originalCwd);
  }
});

Deno.test("parseInitArgs uses '.' as explicit current directory", async () => {
  const originalCwd = Deno.cwd();

  try {
    Deno.chdir("/tmp");
    const options = await parseInitArgs(
      [
        ".",
        "--scope",
        "@test",
        "--github-user",
        "testuser",
        "--github-repo",
        "test-repo",
        "--codeowner",
        "@test",
        "--security-email",
        "test@example.com",
      ],
    );
    assertEquals(options.targetDir, ".");
    assertEquals(options.appName, "tmp");
  } finally {
    Deno.chdir(originalCwd);
  }
});

Deno.test("parseInitArgs normalizes underscores to hyphens in app names", async () => {
  const originalCwd = Deno.cwd();

  try {
    Deno.chdir("/tmp");
    const options = await parseInitArgs(
      [
        "my_underscore_app",
        "--scope",
        "@test",
        "--github-user",
        "testuser",
        "--github-repo",
        "test-repo",
        "--codeowner",
        "@test",
        "--security-email",
        "test@example.com",
      ],
    );
    assertEquals(options.appName, "my-underscore-app");
  } finally {
    Deno.chdir(originalCwd);
  }
});

Deno.test("parseInitArgs defaults includeConfig to true", async () => {
  const options = await parseInitArgs(
    [
      "my-app",
      "--scope",
      "@test",
      "--github-user",
      "testuser",
      "--github-repo",
      "test-repo",
      "--codeowner",
      "@test",
      "--security-email",
      "test@example.com",
    ],
  );
  assertEquals(options.includeConfig, true);
});

Deno.test("parseInitArgs sets includeConfig to false when --no-config is passed", async () => {
  const options = await parseInitArgs(
    [
      "my-app",
      "--no-config",
      "--scope",
      "@test",
      "--github-user",
      "testuser",
      "--github-repo",
      "test-repo",
      "--codeowner",
      "@test",
      "--security-email",
      "test@example.com",
    ],
  );
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

Deno.test("parseInitArgs throws with helpful message when missing required flags in non-interactive mode", async () => {
  try {
    await parseInitArgs(["my-app"]);
    assert(false, "Expected ValidationError to be thrown");
  } catch (error) {
    assert(error instanceof ValidationError);
    assertStringIncludes(error.message, "Missing --scope. Provide via flag");
  }
});

Deno.test("parseInitArgs throws with helpful message for githubUser", async () => {
  try {
    await parseInitArgs(
      [
        "my-app",
        "--scope",
        "@test",
        "--github-repo",
        "test-repo",
        "--codeowner",
        "@test",
        "--security-email",
        "test@example.com",
      ],
    );
    assert(false, "Expected ValidationError to be thrown");
  } catch (error) {
    assert(error instanceof ValidationError);
    assertStringIncludes(error.message, "Missing --githubUser. Provide via flag");
  }
});

Deno.test("parseInitArgs uses prompted values when no flags provided but PromptProvider given", async () => {
  const mockProvider = {
    scope: () => Promise.resolve("@mock-scope"),
    githubUser: () => Promise.resolve("mock-user"),
    githubRepo: () => Promise.resolve("mock-repo"),
    codeOwner: () => Promise.resolve("@mock-owner"),
    securityEmail: () => Promise.resolve("mock@example.com"),
  };

  const options = await parseInitArgs([], mockProvider);

  assertEquals(options.scope, "@mock-scope");
  assertEquals(options.githubUser, "mock-user");
  assertEquals(options.githubRepo, "mock-repo");
  assertEquals(options.codeOwner, "@mock-owner");
  assertEquals(options.securityEmail, "mock@example.com");
});

Deno.test("parseInitArgs prefers flag values over PromptProvider values", async () => {
  const mockProvider = {
    scope: () => Promise.resolve("@mock-scope"),
    githubUser: () => Promise.resolve("mock-user"),
    githubRepo: () => Promise.resolve("mock-repo"),
    codeOwner: () => Promise.resolve("@mock-owner"),
    securityEmail: () => Promise.resolve("mock@example.com"),
  };

  const options = await parseInitArgs(
    [
      "--scope",
      "@from-flag",
      "--github-user",
      "from-flag-user",
      "--github-repo",
      "from-flag-repo",
      "--codeowner",
      "@from-flag-owner",
      "--security-email",
      "flag@example.com",
    ],
    mockProvider,
  );

  assertEquals(options.scope, "@from-flag");
  assertEquals(options.githubUser, "from-flag-user");
  assertEquals(options.githubRepo, "from-flag-repo");
  assertEquals(options.codeOwner, "@from-flag-owner");
  assertEquals(options.securityEmail, "flag@example.com");
});

Deno.test("parseInitArgs githubRepo prompt receives derived appName as defaultValue", async () => {
  let receivedDefault: string | undefined;
  const mockProvider = {
    scope: () => Promise.resolve("@test"),
    githubUser: () => Promise.resolve("test-user"),
    githubRepo: (defaultValue: string) => {
      receivedDefault = defaultValue;
      return Promise.resolve("test-repo");
    },
    codeOwner: () => Promise.resolve("@test"),
    securityEmail: () => Promise.resolve("test@example.com"),
  };

  await parseInitArgs(["my-app"], mockProvider);

  assertEquals(receivedDefault, "my-app");
});

Deno.test("parseFlags throws when given an unknown flag", () => {
  try {
    parseFlags(["--unknown-flag"]);
    assert(false, "Expected ValidationError to be thrown");
  } catch (error) {
    assert(error instanceof ValidationError);
    assertStringIncludes(error.message, "Unknown flag: --unknown-flag");
  }
});

Deno.test("parseFlags throws when a flag value is missing", () => {
  try {
    parseFlags(["--scope"]);
    assert(false, "Expected ValidationError to be thrown");
  } catch (error) {
    assert(error instanceof ValidationError);
    assertStringIncludes(error.message, "Missing value for --scope");
  }
});

Deno.test("parseFlags throws when flag value looks like a flag", () => {
  try {
    parseFlags(["--scope", "--another"]);
    assert(false, "Expected ValidationError to be thrown");
  } catch (error) {
    assert(error instanceof ValidationError);
    assertStringIncludes(error.message, "Missing value for --scope");
  }
});
