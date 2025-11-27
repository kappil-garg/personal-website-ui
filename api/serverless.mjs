import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the built Angular server
const serverFile = resolve(__dirname, '../dist/personal-website-ui/server/server.mjs');

// Import and use the built Angular server handler
const { reqHandler } = await import(serverFile);

// Vercel serverless function handler
export default (req, res) => {
  reqHandler(req, res);
};
