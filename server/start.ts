import { createServer } from "http";
import { createApp } from "./_core/index";

const server = createServer();
const app = await createApp(server);
server.removeAllListeners("request");
server.on("request", app);

const port = Number(process.env.PORT || "3000");
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("Invalid PORT");
}

server.on("error", error => {
  console.error("Server failed:", error.message);
  process.exit(1);
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on port ${port}`);
});
