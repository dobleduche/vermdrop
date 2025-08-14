import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  registerUser,
  getRegistration,
  updateVerification,
  getRegistrationStats
} from "./routes/registration";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Registration endpoints
  app.post("/api/registration", registerUser);
  app.get("/api/registration/:wallet_address", getRegistration);
  app.put("/api/registration/verify", updateVerification);
  app.get("/api/registration-stats", getRegistrationStats);

  return app;
}
