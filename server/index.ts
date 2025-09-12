import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  registerUser,
  getRegistration,
  updateVerification,
  getRegistrationStats,
} from "./routes/registration";
import {
  registrationLimiter,
  verificationLimiter,
  generalLimiter,
} from "./middleware/rateLimiter";
import {
  errorHandler,
  notFoundHandler,
  asyncHandler,
} from "./middleware/errorHandler";
import { getReferralInfo, trackReferral } from "./routes/referrals";

export function createServer() {
  const app = express();

  // Disable fingerprinting header
  app.disable("x-powered-by");

  // Trust proxy for rate limiting
  app.set("trust proxy", 1);

  // Middleware
  app.use(
    cors({
      origin:
        process.env.ALLOWED_ORIGINS
          ? (process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim()))
          : true,
      credentials: true,
    }),
  );

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Security headers
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-DNS-Prefetch-Control", "off");
    res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    if (process.env.NODE_ENV === "production") {
      res.setHeader(
        "Strict-Transport-Security",
        "max-age=15552000; includeSubDomains",
      );
    }
    next();
  });

  // Health check
  app.get("/ping", generalLimiter.middleware(), (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "pong";
    res.json({
      message: ping,
      timestamp: new Date().toISOString(),
      status: "healthy",
    });
  });

  app.get("/demo", generalLimiter.middleware(), handleDemo);

  // Registration endpoints with rate limiting
  app.post(
    "/registration",
    registrationLimiter.middleware(),
    asyncHandler(registerUser),
  );

  app.get(
    "/registration/:wallet_address",
    generalLimiter.middleware(),
    asyncHandler(getRegistration),
  );

  app.put(
    "/registration/verify",
    verificationLimiter.middleware(),
    asyncHandler(updateVerification),
  );

  app.get(
    "/registration-stats",
    generalLimiter.middleware(),
    asyncHandler(getRegistrationStats),
  );

  // Referral endpoints
  app.get(
    "/referral/:wallet",
    generalLimiter.middleware(),
    asyncHandler(getReferralInfo),
  );
  app.post(
    "/referral/track",
    generalLimiter.middleware(),
    asyncHandler(trackReferral),
  );

  // Error handlers (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
