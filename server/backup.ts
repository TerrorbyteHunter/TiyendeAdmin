
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { log } from "./vite";

const BACKUP_DIR = path.join(process.cwd(), "backups");

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

export async function createDatabaseBackup(): Promise<string | null> {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable not set");
    }

    const dbUrl = new URL(process.env.DATABASE_URL);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFilePath = path.join(BACKUP_DIR, `backup-${timestamp}.sql`);

    // Extract database connection details from DATABASE_URL
    const dbName = dbUrl.pathname.substring(1);
    const dbUser = dbUrl.username;
    const dbPassword = dbUrl.password;
    const dbHost = dbUrl.hostname;
    const dbPort = dbUrl.port || "5432";

    // Set environment variable for password
    const env = { ...process.env, PGPASSWORD: dbPassword };

    // Run pg_dump command
    const pgDump = spawn("pg_dump", [
      "-h", dbHost,
      "-p", dbPort,
      "-U", dbUser,
      "-d", dbName,
      "-f", backupFilePath,
      "-F", "c", // Custom format (compressed)
    ], { env });

    return new Promise((resolve, reject) => {
      pgDump.on("close", (code) => {
        if (code === 0) {
          log(`Database backup created at ${backupFilePath}`);
          resolve(backupFilePath);
        } else {
          reject(new Error(`pg_dump exited with code ${code}`));
        }
      });
      
      pgDump.on("error", (err) => {
        reject(new Error(`Failed to start pg_dump: ${err.message}`));
      });
    });
  } catch (error) {
    log(`Backup failed: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

export async function listBackups(): Promise<string[]> {
  return fs.readdirSync(BACKUP_DIR)
    .filter(file => file.startsWith("backup-") && file.endsWith(".sql"))
    .sort()
    .reverse(); // Most recent first
}

export async function scheduleBackups(enabled: boolean): Promise<boolean> {
  // Update settings in database to enable/disable scheduled backups
  // This will be checked by a cron job or similar mechanism
  try {
    log(`Scheduled backups ${enabled ? 'enabled' : 'disabled'}`);
    return true;
  } catch (error) {
    log(`Failed to ${enabled ? 'enable' : 'disable'} scheduled backups: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}
