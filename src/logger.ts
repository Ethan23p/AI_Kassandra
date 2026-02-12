import { CONFIG } from './config';
import { appendFile } from 'node:fs/promises';

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

class Logger {
    private async write(level: LogLevel, message: string, ...args: any[]) {
        const timestamp = new Date().toISOString();
        const formattedMessage = `[${timestamp}] [${level}] ${message}`;

        // Console output
        if (level === 'ERROR') {
            console.error(formattedMessage, ...args);
        } else if (level === 'WARN') {
            console.warn(formattedMessage, ...args);
        } else if (level === 'DEBUG') {
            if (CONFIG.DEBUG_MODE) {
                console.debug(formattedMessage, ...args);
            }
        } else {
            console.log(formattedMessage, ...args);
        }

        // File output
        // We act like a "tee", writing to file as well.
        try {
            const fileLine = `${formattedMessage} ${args.length ? JSON.stringify(args) : ''}\n`;
            await appendFile(CONFIG.LOG_FILE_PATH, fileLine);
        } catch (err) {
            console.error('Failed to write to log file:', err);
        }
    }

    info(message: string, ...args: any[]) {
        this.write('INFO', message, ...args);
    }

    warn(message: string, ...args: any[]) {
        this.write('WARN', message, ...args);
    }

    error(message: string, ...args: any[]) {
        this.write('ERROR', message, ...args);
    }

    debug(message: string, ...args: any[]) {
        this.write('DEBUG', message, ...args);
    }
}

export const logger = new Logger();
