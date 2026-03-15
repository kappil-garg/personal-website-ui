import { AngularNodeAppEngine, createNodeRequestHandler, isMainModule, writeResponseToNodeResponse } from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();

// Allowed hosts for Angular SSR (SSRF protection). Override in production via SSR_ALLOWED_HOSTS (comma-separated; use '*' to allow any).
const defaultAllowedHosts = [
  'localhost',
  '127.0.0.1',
  'kappilgarg.dev',
  'www.kappilgarg.dev',
];
const rawAllowedHosts = process.env['SSR_ALLOWED_HOSTS'];

let allowedHosts: string[] | undefined = defaultAllowedHosts;

if (rawAllowedHosts && rawAllowedHosts.trim().length > 0) {
  if (rawAllowedHosts.trim() === '*') {
    allowedHosts = undefined;
  } else {
    const parsed = rawAllowedHosts
      .split(',')
      .map((host) => host.trim())
      .filter((host) => host.length > 0);
    allowedHosts = parsed.length > 0 ? parsed : undefined;
  }
}

const angularApp = new AngularNodeAppEngine({ allowedHosts });

/**
 * Serve static files from browser directory.
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI.
 */
export const reqHandler = createNodeRequestHandler(app);
