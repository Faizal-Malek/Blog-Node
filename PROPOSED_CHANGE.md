# Proposed Changes for Vercel Deployment

## Summary
This PR adds Vercel serverless adapter configuration to enable deployment of the Express/EJS blog application on Vercel's serverless platform.

## Changes Made

### 1. Added `api/index.js`
- Serverless wrapper that uses `serverless-http` to adapt the Express app
- Attempts to require the app from common locations: `../app`, `../server`, `../src/app`, `../src/server`
- Returns helpful error message if app cannot be found

### 2. Added `vercel.json`
- Configures Node.js 18 runtime for the serverless function
- Routes all requests to `/api/index.js` to handle client-side routing
- Uses `@vercel/node` builder for the API route

### 3. Updated `package.json`
- Added `serverless-http@^3.0.0` dependency

### 4. Added `.gitignore`
- Excludes `node_modules`, `.env`, logs, and `.vercel` directory from git

## Required Changes for Maintainers

### Update: app.js has been modified
The `app.js` file has been updated to export the app instance while maintaining local development compatibility. The changes include:

1. **Mongoose connection moved to end**: The connection is now established after all middleware and routes are configured
2. **Conditional server start**: The app only calls `listen()` when run directly (not when imported as a module)
3. **App export**: The app is now exported for use by the serverless adapter

The current structure:
```javascript
// ... (Express app setup, middleware, routes)

// Connect to MongoDB
mongoose
  .connect(dbURI)
  .then((result) => {
    console.log("Connected to MongoDB");
    // Only start server if not in serverless environment
    if (require.main === module) {
      app.listen(3000, () => {
        console.log("Server running on port 3000");
      });
    }
  })
  .catch((err) => console.error(err));

// Export the app for serverless deployment
module.exports = app;
```

### For Local Development
The app works the same way as before:
```bash
npm start  # or node app.js
```

The server will listen on port 3000 as usual.

## Deployment Steps

1. Merge this PR
2. Make the recommended changes to `app.js` (see above)
3. Run `npm install` to install `serverless-http`
4. Commit the changes
5. Deploy or redeploy on Vercel
6. Vercel will automatically install dependencies and run the serverless function

## Environment Variables

If your app uses environment variables (like MongoDB connection string), make sure to add them in the Vercel dashboard:
- Go to Project Settings > Environment Variables
- Add all required variables (e.g., `MONGODB_URI`)

## Testing Locally

To test locally before deploying:
```bash
npm install
npm start  # Test with regular server
# Or use Vercel CLI:
vercel dev
```

## Notes

- The MongoDB connection string is currently hardcoded in `app.js`. Consider moving it to an environment variable for security.
- Serverless functions have cold start times, so the first request after a period of inactivity may be slower.
- Static files in the `public` directory will be served correctly through the Express middleware.
- EJS views will work as expected since they're rendered server-side.
