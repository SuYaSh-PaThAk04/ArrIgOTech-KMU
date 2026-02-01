import "dotenv/config";
import express from "express";
import cors from "cors";

import sessionRoutes from "./routes/sesion.routes.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/health", (req, res) => {
  res.json({ ok: true, message: "drone-server running" });
});

app.use("/api/sessions", sessionRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`[server] running on http://localhost:${port}`);
});
