// Types
type LogLevel = 'debug' | 'info' | 'auth' | 'security' | 'error';

// Log levels hierarchy (lower index = more verbose)
const LOG_LEVELS: LogLevel[] = ['debug', 'info', 'auth', 'security', 'error'];

interface LogContext {
    [key: string]: unknown;
    ip?: string;
    path?: string;
    method?: string;
    username?: string;
    sessionId?: string;
}

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    context: LogContext;
}

interface LoggerConfig {
    minLevel: LogLevel;
    maxBufferSize: number;
    exportPath?: string;
}

// Logger implementation
class Logger {
    private static instance: Logger;
    private logBuffer: LogEntry[] = [];
    private config: LoggerConfig = {
        minLevel: import.meta.env.PROD ? 'auth' : 'debug',
        maxBufferSize: 1000
    };

    private constructor() {
        // Private constructor for singleton
    }

    static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    // Configure logger
    configure(config: Partial<LoggerConfig>): void {
        this.config = { ...this.config, ...config };
        
        // Trim buffer if size decreased
        if (this.logBuffer.length > this.config.maxBufferSize) {
            this.logBuffer = this.logBuffer.slice(-this.config.maxBufferSize);
        }
    }

    private shouldLog(level: LogLevel): boolean {
        return LOG_LEVELS.indexOf(level) >= LOG_LEVELS.indexOf(this.config.minLevel);
    }

    private async exportToFile(entry: LogEntry): Promise<void> {
        if (!this.config.exportPath) return;

        try {
            const fs = await import('node:fs/promises');
            const path = await import('node:path');
            
            // Create log line
            const logLine = `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message} ${JSON.stringify(entry.context)}\n`;
            
            // Append to file
            await fs.appendFile(
                path.join(process.cwd(), this.config.exportPath),
                logLine,
                'utf-8'
            );
        } catch (err) {
            console.error('Failed to export log:', err);
        }
    }

    private log(level: LogLevel, message: string, context: LogContext = {}): void {
        // Check if we should log this level
        if (!this.shouldLog(level)) return;

        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            context
        };

        // In development, log to console with colors
        if (import.meta.env.DEV) {
            const color = {
                debug: '\x1b[90m',    // Gray
                info: '\x1b[36m',     // Cyan
                auth: '\x1b[32m',     // Green
                security: '\x1b[33m',  // Yellow
                error: '\x1b[31m'     // Red
            }[level];

            console.log(
                `${color}[${entry.timestamp}] [${level.toUpperCase()}] ${message}\x1b[0m`,
                context
            );
        }

        // Store in buffer
        this.logBuffer.push(entry);

        // Keep buffer size within limits
        if (this.logBuffer.length > this.config.maxBufferSize) {
            this.logBuffer = this.logBuffer.slice(-this.config.maxBufferSize);
        }

        // Export to file if configured
        this.exportToFile(entry);
    }

    debug(message: string, context?: LogContext): void {
        this.log('debug', message, context);
    }

    info(message: string, context?: LogContext): void {
        this.log('info', message, context);
    }

    auth(message: string, context?: LogContext): void {
        this.log('auth', message, context);
    }

    security(message: string, context?: LogContext): void {
        this.log('security', message, context);
    }

    error(message: string, context?: LogContext): void {
        this.log('error', message, context);
    }

    // Get logs for debugging/analysis
    getLogs(options?: { 
        level?: LogLevel; 
        startTime?: Date; 
        endTime?: Date;
        limit?: number;
    }): LogEntry[] {
        let logs = this.logBuffer;

        if (options?.level) {
            logs = logs.filter(entry => entry.level === options.level);
        }

        if (options?.startTime) {
            logs = logs.filter(entry => new Date(entry.timestamp) >= options.startTime!);
        }

        if (options?.endTime) {
            logs = logs.filter(entry => new Date(entry.timestamp) <= options.endTime!);
        }

        if (options?.limit) {
            logs = logs.slice(-options.limit);
        }

        return logs;
    }

    // Export logs to file
    async exportLogs(filepath: string, options?: { 
        level?: LogLevel;
        startTime?: Date;
        endTime?: Date;
    }): Promise<void> {
        const logs = this.getLogs(options);
        const fs = await import('node:fs/promises');
        const path = await import('node:path');

        const content = logs.map(entry => 
            `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message} ${JSON.stringify(entry.context)}`
        ).join('\n') + '\n';

        await fs.writeFile(
            path.join(process.cwd(), filepath),
            content,
            'utf-8'
        );
    }
}

// Export singleton instance
export const logger = Logger.getInstance(); 