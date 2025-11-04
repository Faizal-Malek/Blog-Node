/**
 * Vercel Serverless Function Wrapper
 * 
 * This file wraps your Express app so it can run as a serverless function on Vercel.
 * It attempts to import the Express app from common locations and wraps it with serverless-http.
 */

const serverless = require('serverless-http');

let app;

// Common locations where the Express app might be exported
const appPaths = ['../app', '../server', '../src/app'];

// Try to require the Express app from common locations
for (const path of appPaths) {
  try {
    app = require(path);
    console.log(`Loaded Express app from ${path}`);
    break;
  } catch (e) {
    // Continue to next path
  }
}

if (!app) {
  console.error(`Could not load Express app from any common location: ${appPaths.join(', ')}`);
  throw new Error('Express app not found. Please ensure your app exports the Express instance.');
}

// Wrap the Express app with serverless-http and export for Vercel
module.exports = serverless(app);
