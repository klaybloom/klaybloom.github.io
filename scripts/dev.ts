import { spawn, type ChildProcess } from "node:child_process";

const children = new Set<ChildProcess>();
let stopping = false;

function start(command: string, args: string[]) {
  const child = spawn(command, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
  });
  children.add(child);
  child.once("exit", (code, signal) => {
    children.delete(child);
    if (!stopping) {
      process.exitCode = code ?? (signal ? 1 : 0);
      stopChildren("SIGTERM");
    }
  });
  child.once("error", (error) => {
    console.error(`[Klay Studio] Failed to start ${command}:`, error);
    process.exitCode = 1;
    stopChildren("SIGTERM");
  });
}

function stopChildren(signal: NodeJS.Signals) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    child.kill(signal);
  }
  if (children.size === 0) process.exit();
}

process.once("SIGINT", () => stopChildren("SIGINT"));
process.once("SIGTERM", () => stopChildren("SIGTERM"));

start("npm", ["exec", "tsx", "--", "scripts/dev-server.ts"]);
start("npm", ["exec", "next", "--", "dev"]);
