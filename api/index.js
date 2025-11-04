const serverless = require('serverless-http');

/**
 * Vercel serverless function handler
 * This wraps the Express app with serverless-http for deployment on Vercel
 */

// Try to load the Express app from common paths
const possiblePaths = [
  '../app',
  '../server', 
  '../src/app',
  '../src/server',
  './app'
];

let app = null;
let appPath = null;

for (const path of possiblePaths) {
  try {
    const module = require(path);
    // Check if we got a server instance (has listening property) vs an app
    if (module && typeof module === 'object') {
      if (module.listening !== undefined) {
        // This is a server instance, not an app
        console.error(`Error: ${path} exports a server instance (called listen()). Please export the app instance instead.`);
        module.exports = async (req, res) => {
          res.status(500).json({
            error: 'Configuration Error',
            message: `The module at ${path} exports a server instance instead of the Express app. Please ensure your main file exports the app instance (module.exports = app) without calling app.listen().`,
            fix: 'Remove app.listen() from the exported module and export only the app instance.'
          });
        };
        break;
      }
      app = module;
      appPath = path;
      console.log(`Successfully loaded Express app from ${path}`);
      break;
    }
  } catch (err) {
    // Path doesn't exist or can't be loaded, try next one
    continue;
  }
}

if (!app) {
  // No app found at any of the common paths
  console.error('Could not find Express app at any common path');
  module.exports = async (req, res) => {
    res.status(500).json({
      error: 'Configuration Error',
      message: 'Could not find Express app. Tried paths: ' + possiblePaths.join(', '),
      fix: 'Please ensure your Express app is exported from one of these paths, or modify api/index.js to require your app from the correct location.',
      instructions: [
        '1. Your main file should export the Express app instance: module.exports = app;',
        '2. Do NOT call app.listen() in the file that exports the app',
        '3. For local development, create a separate server.js that requires and starts the app'
      ]
    });
  };
} else {
  // Successfully loaded the app, wrap it with serverless-http
  module.exports = serverless(app);
}
