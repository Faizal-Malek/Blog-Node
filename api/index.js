/**
 * Vercel Serverless Function Wrapper
 * 
 * This file wraps your Express app so it can run as a serverless function on Vercel.
 * It attempts to import the Express app from common locations and wraps it with serverless-http.
 */

const serverless = require('serverless-http');

let app;

// Try to require the Express app from common locations
try {
  // Try app.js in the root (most common)
  app = require('../app');
  console.log('Loaded Express app from ../app');
} catch (e) {
  try {
    // Try server.js in the root
    app = require('../server');
    console.log('Loaded Express app from ../server');
  } catch (e2) {
    try {
      // Try src/app.js
      app = require('../src/app');
      console.log('Loaded Express app from ../src/app');
    } catch (e3) {
      console.error('Could not load Express app from any common location (../app, ../server, ../src/app)');
      throw new Error('Express app not found. Please ensure your app exports the Express instance.');
    }
  }
}

// Wrap the Express app with serverless-http and export for Vercel
module.exports = serverless(app);
