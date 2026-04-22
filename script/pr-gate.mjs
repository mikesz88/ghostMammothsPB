import { execSync } from "node:child_process";

const blockingCommands = ["npm run lint", "npm run typecheck"];
const reportingCommands = ["npm run architecture:audit"];

try {
  for (const command of blockingCommands) {
    console.log(`\nRunning blocking check: ${command}\n`);
    execSync(command, { stdio: "inherit" });
  }

  for (const command of reportingCommands) {
    console.log(`\nRunning reporting check: ${command}\n`);
    execSync(command, { stdio: "inherit" });
  }

  console.log("\nPR gate passed. Reporting checks completed.\n");
} catch {
  console.error("\nPR gate failed.\n");
  process.exit(1);
}
