import type { TemplateContext } from "@scaffold/types";

export const metadata = { outputPath: ".opencode/plugins/deno-guards.ts" };

export default function (_context: TemplateContext): string {
  return `import type { Plugin } from "@opencode-ai/plugin";

export const DenoEnforcePlugin: Plugin = async ({ $, worktree }) => {
  let changed = false;
  let running = false;

  const runChecks = async () => {
    if (running) return;
    running = true;
    try {
      await \$\`cd \${worktree} && deno lint\`;
      await \$\`cd \${worktree} && deno check\`;
      console.log("[opencode] deno lint + deno check passed");
    } catch (err) {
      console.error("[opencode] Deno validation failed:", err);
    } finally {
      running = false;
    }
  };

  return {
    event: async ({ event }) => {
      if (event.type === "file.edited") {
        changed = true;
      }

      // Run once after opencode settles, instead of once per individual edit.
      if (event.type === "session.idle" && changed) {
        changed = false;
        await runChecks();
      }
    },
  };
};
`;
}
