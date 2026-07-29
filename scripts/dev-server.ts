import { createAdminServer } from "./admin-server";

const server = createAdminServer();

server.listen(8081, "127.0.0.1", () => {
  console.log("[Klay Studio] Local admin service: http://127.0.0.1:8081");
});

function shutdown(signal: NodeJS.Signals) {
  console.log(`[Klay Studio] Local admin service received ${signal}`);
  server.close((error) => {
    if (error) {
      console.error(error);
      process.exitCode = 1;
    }
    process.exit();
  });
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
