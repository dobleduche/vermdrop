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
import {
  registrationLimiter,
  verificationLimiter,
  generalLimiter
} from "./middleware/rateLimiter";
import {
  errorHandler,
  notFoundHandler,
  asyncHandler
} from "./middleware/errorHandler";

export function createServer() {
  const app = express();

  // Trust proxy for rate limiting
  app.set('trust proxy', 1);

  // Middleware
  app.use(cors({
    origin: process.env.NODE_ENV === 'production'
      ? ['https://nimrev.xyz', 'https://www.nimrev.xyz']
      : true,
    credentials: true
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Health check
  app.get("/api/ping", generalLimiter.middleware(), (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "pong";
    res.json({
      message: ping,
      timestamp: new Date().toISOString(),
      status: 'healthy'
    });
  });

  app.get("/api/demo", generalLimiter.middleware(), handleDemo);

  // Registration endpoints with rate limiting
  app.post("/api/registration",
    registrationLimiter.middleware(),
    asyncHandler(registerUser)
  );

  app.get("/api/registration/:wallet_address",
    generalLimiter.middleware(),
    asyncHandler(getRegistration)
  );

  app.put("/api/registration/verify",
    verificationLimiter.middleware(),
    asyncHandler(updateVerification)
  );

  app.get("/api/registration-stats",
    generalLimiter.middleware(),
    asyncHandler(getRegistrationStats)
  );

  // Error handlers (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
