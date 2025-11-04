const serverless = require('serverless-http');

// Attempt to require the Express app from common locations
let app;
const possiblePaths = [
  '../app',
  '../server',
  '../src/app',
  '../src/server'
];

for (const path of possiblePaths) {
  try {
    app = require(path);
    console.log(`Successfully loaded app from: ${path}`);
    break;
  } catch (err) {
    // Continue to next path
  }
}

if (!app) {
  // If no app is found, return a helpful error
  module.exports = (req, res) => {
    res.status(500).json({
      error: 'Express app not found',
      message: 'Could not locate the Express app. Please ensure your app is exported from one of: app.js, server.js, src/app.js, or src/server.js',
      triedPaths: possiblePaths
    });
  };
} else {
  // Wrap the Express app with serverless-http
  module.exports = serverless(app);
}
