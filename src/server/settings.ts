import path, { dirname } from "path";
import { fileURLToPath } from "url";

export const IS_PRODUCTION = process.env.NODE_ENV === "production";
export const PROTOCOL = process.env.PROTOCOL || "http";
export const HOST = process.env.HOST || "localhost";
export const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

export const CLIENT_PATH = path.join(__dirname, "..", "client");
