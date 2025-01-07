// Security-focused logger
// Provides structured logging for security events

interface LogMetadata {
  ip?: string;
  username?: string;
  sessionId?: string;
  error?: string;
  [key: string]: any;
}

export const logger = {
  auth: (msg: string, meta?: LogMetadata) => {
    console.log(
      `[${new Date().toISOString()}] 🔐 AUTH: ${msg}`,
      meta ? JSON.stringify(meta) : ''
    );
  },

  security: (msg: string, meta?: LogMetadata) => {
    console.log(
      `[${new Date().toISOString()}] 🛡️ SECURITY: ${msg}`,
      meta ? JSON.stringify(meta) : ''
    );
  },

  error: (msg: string, meta?: LogMetadata) => {
    console.error(
      `[${new Date().toISOString()}] ❌ ERROR: ${msg}`,
      meta ? JSON.stringify(meta) : ''
    );
  }
}; 