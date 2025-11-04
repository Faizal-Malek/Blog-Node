# Proposed Change: Vercel Deployment Support

## Overview

This PR adds support for deploying this Express/EJS application on Vercel's serverless platform. The changes enable the app to run as a serverless function while maintaining compatibility with local development.

## What Was Added

### 1. `api/index.js` - Serverless Function Wrapper
A serverless adapter that:
- Attempts to load the Express app from common entry points (`app.js`, `server.js`, `src/app.js`, etc.)
- Wraps the Express app with `serverless-http` to handle requests in Vercel's serverless environment
- Returns a helpful error message if the app cannot be loaded

### 2. `vercel.json` - Vercel Configuration
Configures Vercel to:
- Use Node.js 18.x runtime
- Route all requests to the serverless function at `api/index.js`
- Handle both static assets and dynamic routes

### 3. `package.json` - Dependencies
Added `serverless-http` (^3.0.0) to dependencies for Express-to-serverless adaptation.

## Required Changes for Maintainers

### ⚠️ Important: Export the Express App

The current `app.js` file calls `app.listen()` directly in the mongoose connection callback. For Vercel deployment to work, the Express app needs to be **exported** instead.

#### Current Code (app.js, lines 13-16):
```javascript
mongoose
  .connect(dbURI)
  .then((result) => app.listen(3000))
  .catch((err) => console.error(err));
```

#### Recommended Change:

**Option 1: Export the app and handle connection separately**

Update `app.js` to export the app:
```javascript
mongoose
  .connect(dbURI)
  .then((result) => console.log('Connected to MongoDB'))
  .catch((err) => console.error(err));

// Export the app for serverless deployment
module.exports = app;
```

Then create a `server.js` file for local development:
```javascript
const app = require('./app');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Option 2: Conditional export**

Modify `app.js` to conditionally listen or export:
```javascript
mongoose
  .connect(dbURI)
  .then((result) => {
    if (require.main === module) {
      // Only start server if this file is run directly
      app.listen(3000, () => console.log('Server running on port 3000'));
    }
  })
  .catch((err) => console.error(err));

// Always export the app
module.exports = app;
```

### Update package.json Start Script

If you choose Option 1, update `package.json`:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  }
}
```

## Deployment Instructions

1. **Merge this PR** to your main branch
2. **Make the required code changes** described above (export the Express app)
3. **Connect your GitHub repository** to Vercel:
   - Visit [vercel.com](https://vercel.com)
   - Import your repository
   - Vercel will automatically detect the configuration
4. **Configure environment variables** in Vercel dashboard:
   - Add your MongoDB connection string as `MONGODB_URI` or update the code to use `process.env.MONGODB_URI`
   - Any other environment-specific variables

## Testing Locally

After making the changes:

```bash
# Install dependencies (including serverless-http)
npm install

# Run locally with the new server.js
npm start

# Test the serverless function locally (optional, requires Vercel CLI)
npx vercel dev
```

## Notes

- **Static files**: The `public` directory will be served correctly by Vercel
- **EJS views**: Views will work in serverless mode as they're rendered server-side
- **Database connections**: MongoDB connections in serverless environments are handled per-request. Consider using connection pooling or MongoDB Atlas for better performance.
- **Environment variables**: Use Vercel's environment variable settings for production secrets

## Alternative: If This App is Actually Next.js or Static

If this application is actually:
- A **Next.js** app: Remove these changes and ensure you have a `next.config.js` file
- A **static SPA** (React, Vue, Angular): Use a different Vercel configuration for static deployments

This configuration is specifically for **Express.js applications** with server-side rendering (EJS in this case).

## Support

If you encounter issues during deployment:
1. Check Vercel deployment logs for error messages
2. Ensure all environment variables are configured
3. Verify the Express app is properly exported from `app.js`
4. Check that the MongoDB connection string is accessible in the serverless environment

## References

- [Vercel Node.js Documentation](https://vercel.com/docs/functions/serverless-functions/runtimes/node-js)
- [serverless-http on npm](https://www.npmjs.com/package/serverless-http)
- [Deploying Express Apps to Vercel](https://vercel.com/guides/using-express-with-vercel)
