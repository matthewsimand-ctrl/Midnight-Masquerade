import express from "express";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { Server } from "socket.io";
import { setupGameSocket } from "./src/server/game.js";
import path from "path";
import { fileURLToPath } from "url";

// Recreate __dirname and __filename for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  // Use Render's dynamically assigned port, fallback to 3000 locally
  const PORT = process.env.PORT || 3000; 
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  // API routes MUST come before static file serving and the catch-all
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Initialize your socket logic
  setupGameSocket(io);

  // Serve frontend: Vite for dev, static files for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    // Fallback: also serve the public folder directly
    // This ensures homescreen.jpg and mask images are always available
    app.use(express.static(path.join(__dirname, "public")));
  }

  // Fallback to index.html to support React Router client-side routing
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist/index.html"));
  });

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
