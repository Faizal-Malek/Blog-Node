/**
 * Vercel Serverless Function Entry Point
 * 
 * This file wraps the Express application for serverless deployment on Vercel.
 * It attempts to require the Express app from common entry points and wraps it
 * with serverless-http to handle requests in a serverless environment.
 */

const serverless = require('serverless-http');

/**
 * Attempts to load the Express app from common entry points
 * @returns {Object} Express app instance or null
 */
function loadApp() {
  const possiblePaths = [
    '../app',
    '../server',
    '../src/app',
    '../src/server',
    './app'
  ];

  for (const path of possiblePaths) {
    try {
      const app = require(path);
      // Some modules might export default or have an app property
      const appInstance = app.default || app.app || app;
      
      // Express apps are objects with use, listen, and other middleware methods
      if (appInstance && typeof appInstance === 'object' && 
          typeof appInstance.use === 'function' && 
          typeof appInstance.listen === 'function') {
        console.log(`✓ Successfully loaded Express app from: ${path}`);
        return appInstance;
      }
    } catch (error) {
      // Log errors for debugging, but continue trying other paths
      console.log(`Could not load from ${path}: ${error.message}`);
      continue;
    }
  }

  return null;
}

// Try to load the Express app
const app = loadApp();

if (!app) {
  // If no app is found, return a helpful error message
  module.exports = (req, res) => {
    res.status(500).json({
      error: 'Express app not found',
      message: 'Could not load Express application from common entry points.',
      instruction: 'Please ensure your Express app is exported from one of these files:',
      possiblePaths: [
        'app.js',
        'server.js',
        'src/app.js',
        'src/server.js'
      ],
      hint: 'Make sure your Express app file exports the app instance (e.g., module.exports = app;) instead of calling app.listen() directly.',
      documentation: 'See PROPOSED_CHANGE.md for detailed instructions.'
    });
  };
} else {
  // Wrap the Express app with serverless-http
  module.exports = serverless(app);
}
