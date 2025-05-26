const isServer = typeof window === "undefined";

// Simple console wrapper that maintains consistent interface
const clientLogger = {
  error: (obj: unknown, msg?: string) => console.error(msg || obj, typeof obj === "object" ? obj : undefined),
  warn: (obj: unknown, msg?: string) => console.warn(msg || obj, typeof obj === "object" ? obj : undefined),
  info: (obj: unknown, msg?: string) => console.info(msg || obj, typeof obj === "object" ? obj : undefined),
  debug: (obj: unknown, msg?: string) => console.debug(msg || obj, typeof obj === "object" ? obj : undefined),
};

// Server-side only import to avoid bundling issues
const getServerLogger = () => {
  if (isServer) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pino = require("pino");
    return pino({
      level: process.env.NODE_ENV === "development" ? "debug" : "info",
      transport:
        process.env.NODE_ENV === "development"
          ? {
              target: "pino-pretty",
              options: {
                colorize: true,
                translateTime: "HH:MM:ss Z",
                ignore: "pid,hostname",
              },
            }
          : undefined,
    });
  }
  return null;
};

const serverLogger = getServerLogger();

export const logger = isServer ? serverLogger : clientLogger;
