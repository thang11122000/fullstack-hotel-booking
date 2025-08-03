import express from "express";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import expressStaticGzip from "express-static-gzip";
import { errorHandler } from "./middleware/errorHandler";
import { logger } from "./utils/logger";
import os from "os";
import { connectMongo } from "./lib/mongo";
import { clerkMiddleware } from "@clerk/express";
import clerkWebhooks from "./controllers/clerkWebhook";
import userRouter from "./routes/userRouter";
import hotelRouter from "./routes/hotelRouter";
import roomRouter from "./routes/roomRouter";
import bookingRouter from "./routes/bookingRouter";

export function createApp() {
  connectMongo();
  const app = express();

  app.set("trust proxy", true);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "ws:", "wss:"],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

  const limiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 1000,
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      return req.path === "/api/health";
    },
  });
  app.use(limiter);

  const authLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 100,
    message: "Too many authentication attempts, please try again later.",
    skipSuccessfulRequests: true,
  });

  app.use(
    cors({
      origin:
        process.env.NODE_ENV === "development"
          ? true
          : (origin, callback) => {
              if (!origin) return callback(null, true);

              const allowedOrigins = process.env.CLIENT_URL?.split(",") || [];

              if (allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
              } else {
                callback(new Error("Not allowed by CORS"));
              }
            },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use(
    compression({
      level: 9,
      threshold: 1024,
      filter: (req: any, res: any) => {
        if (req.headers["x-no-compression"]) {
          return false;
        }
        const compressible = compression.filter(req, res);
        return compressible;
      },
      brotli: {
        params: {
          [require("zlib").constants.BROTLI_PARAM_QUALITY]: 11,
        },
      },
    })
  );

  app.use(
    express.json({
      limit: "10mb",
      verify: (req: any, res, buf) => {
        req.rawBody = buf;
      },
    })
  );
  app.use(
    express.urlencoded({
      extended: true,
      limit: "10mb",
      parameterLimit: 1000,
    })
  );

  app.use(clerkMiddleware());

  app.use((req: any, res, next) => {
    const start = Date.now();
    const requestId = Math.random().toString(36).substring(7);
    req.requestId = requestId;
    logger.info(`${req.method} ${req.path} - ${req.ip} - [${requestId}]`);
    res.on("finish", () => {
      const duration = Date.now() - start;
      const logLevel = duration > 1000 ? "warn" : "info";
      logger[logLevel](
        `${req.method} ${req.path} - ${res.statusCode} - ${duration}ms - [${requestId}]`
      );
    });
    next();
  });

  app.use("/api/clerk", clerkWebhooks);
  app.use("/api/user", userRouter);
  app.use("/api/hotels", hotelRouter);
  app.use("/api/rooms", roomRouter);
  app.use("/api/bookings", bookingRouter);

  if (process.env.NODE_ENV === "production") {
    const staticPath = path.join(__dirname, "../../client/dist");

    app.use(
      "/",
      expressStaticGzip(staticPath, {
        enableBrotli: true,
        orderPreference: ["br", "gz"],
        serveStatic: {
          setHeaders: (res: any, path: string) => {
            if (path.endsWith(".html")) {
              res.setHeader(
                "Cache-Control",
                "no-cache, no-store, must-revalidate"
              );
              res.setHeader("Pragma", "no-cache");
              res.setHeader("Expires", "0");
            } else {
              res.setHeader(
                "Cache-Control",
                "public, max-age=31536000, immutable"
              );
            }

            res.setHeader("X-Content-Type-Options", "nosniff");
            res.setHeader("X-Frame-Options", "DENY");
          },
        },
        index: false,
      })
    );

    app.get("*", (req, res) => {
      res.sendFile(path.join(staticPath, "index.html"), {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });
    });
  }

  app.get("/", (req, res) => {
    res.json({
      message: "Server is running!",
      status: true,
    });
  });

  app.get("/api/health", async (req, res) => {
    try {
      const startTime = Date.now();
      const memUsage = process.memoryUsage();
      const responseTime = Date.now() - startTime;
      res.json({
        status: true,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        worker: process.pid,
        uptime: process.uptime(),
        responseTime: `${responseTime}ms`,
        memory: {
          rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
          external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
        },
        system: {
          cpu: process.cpuUsage(),
          load: os.loadavg(),
        },
      });
    } catch (error) {
      res.status(500).json({
        status: "ERROR",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.get("/api/metrics", async (req, res) => {
    try {
      const metrics = {
        timestamp: new Date().toISOString(),
        worker: process.pid,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        system: {
          load: os.loadavg(),
          freeMemory: os.freemem(),
          totalMemory: os.totalmem(),
        },
        connections: {
          active: 0,
          total: 0,
        },
      };
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to get metrics" });
    }
  });

  app.use("*", (req, res) => {
    res.status(404).json({
      success: false,
      message: "Route not found",
      path: req.originalUrl,
    });
  });

  app.use(errorHandler);

  return app;
}
