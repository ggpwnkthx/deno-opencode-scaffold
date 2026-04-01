#!/usr/bin/env -S deno run --allow-read

const lcovFile = Deno.args[0] ?? "coverage/lcov.info";
const minThreshold = parseFloat(Deno.args[1] ?? "80");

const lcov = await Deno.readTextFile(lcovFile);

let totalLines = 0;
let hitLines = 0;

for (const line of lcov.split("\n")) {
  if (line.startsWith("LH:")) {
    hitLines += parseInt(line.slice(3), 10);
  } else if (line.startsWith("LF:")) {
    totalLines += parseInt(line.slice(3), 10);
  }
}

const coverage = totalLines > 0 ? (hitLines / totalLines) * 100 : 0;

console.log(`Coverage: ${coverage.toFixed(1)}% (${hitLines}/${totalLines} lines)`);

if (coverage < minThreshold) {
  console.error(
    `ERROR: Coverage ${coverage.toFixed(1)}% is below threshold ${minThreshold}%`,
  );
  Deno.exit(1);
}

console.log(`Threshold ${minThreshold}% met.`);
