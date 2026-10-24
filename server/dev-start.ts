import { createServer } from "http";
import { createApp } from "./_core/index";
import { setupVite } from "./_core/vite";

const server = createServer();
const app = await createApp(server, { useVite: true });
await setupVite(app, server);
server.removeAllListeners("request");
server.on("request", app);
server.listen(Number(process.env.PORT || "3000"), "0.0.0.0", () => {
  console.log(`Development server listening on ${process.env.PORT || 3000}`);
});
