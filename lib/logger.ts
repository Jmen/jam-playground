const isServer = typeof window === "undefined";

// Simple console wrapper that maintains consistent interface
const clientLogger = {
  error: (obj: never, msg?: string) => console.error(msg, obj),
  warn: (obj: never, msg?: string) => console.warn(msg, obj),
  info: (obj: never, msg?: string) => console.info(msg, obj),
  debug: (obj: never, msg?: string) => console.debug(msg, obj),
};

// Server-side only import to avoid bundling issues
const getServerLogger = () => {
  if (isServer) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pino = require("pino");
    return pino();
  }
  return null;
};

const serverLogger = getServerLogger();

export const logger = isServer ? serverLogger : clientLogger;
