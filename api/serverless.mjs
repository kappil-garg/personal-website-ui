import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serverFile = resolve(__dirname, '../dist/personal-website-ui/server/server.mjs');

let reqHandler = null;
let initializationError = null;

try {
  const serverModule = await import(serverFile);
  reqHandler = serverModule.reqHandler;
  if (!reqHandler || typeof reqHandler !== 'function') {
    throw new Error('reqHandler is not exported or is not a function');
  }
} catch (error) {
  initializationError = error;
  console.error('Failed to load Angular server:', error);
  console.error('Server file path:', serverFile);
  if (error.code === 'ERR_MODULE_NOT_FOUND') {
    console.error('Server file not found. Ensure the build completed successfully.');
  } else if (error.code === 'ERR_INVALID_MODULE_SPECIFIER') {
    console.error('Invalid module specifier. Check the server file path.');
  }
}

export default (req, res) => {
  if (initializationError || !reqHandler) {
    console.error('Server handler not available:', initializationError?.message || 'Unknown error');
    res.status(500).json({
      error: 'Server initialization failed',
      message: process.env.NODE_ENV === 'development'
        ? initializationError?.message
        : 'Please contact support if this issue persists'
    });
    return;
  }
  try {
    reqHandler(req, res);
  } catch (error) {
    console.error('Error handling request:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Request handling failed',
        message: process.env.NODE_ENV === 'development' 
          ? error.message
          : 'An error occurred while processing your request'
      });
    }
  }
};
