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

1. Merge this PR (all necessary changes are included)
2. Run `npm install` to install `serverless-http`
3. **IMPORTANT**: Move the MongoDB connection string to environment variables (see Security section below)
4. Deploy or redeploy on Vercel
5. Vercel will automatically install dependencies and run the serverless function

## Security Considerations

### Critical: MongoDB Connection String
The MongoDB connection string is currently hardcoded in `app.js` with credentials exposed:
```javascript
const dbURI = "mongodb+srv://netninja:test1234@nodeproject.62tovra.mongodb.net/...";
```

**This is a security vulnerability and must be addressed before deployment.**

To fix this:
1. Create a `.env` file locally (already in .gitignore):
```
MONGODB_URI=mongodb+srv://netninja:test1234@nodeproject.62tovra.mongodb.net/NodeProject?retryWrites=true&w=majority&appName=NodeProject
```

2. Update `app.js` to use environment variable:
```javascript
const dbURI = process.env.MONGODB_URI || "mongodb://localhost:27017/fallback";
```

3. Add the `MONGODB_URI` environment variable in Vercel dashboard:
   - Go to Project Settings > Environment Variables
   - Add `MONGODB_URI` with your connection string
   - The value will be securely stored and not exposed in your code

## Environment Variables

Make sure to add all required environment variables in the Vercel dashboard:
- Go to Project Settings > Environment Variables
- Add `MONGODB_URI` with your connection string (see Security section above)
- Add any other environment variables your app needs

**Do not commit sensitive credentials to your repository.**

## Testing Locally

To test locally before deploying:
```bash
npm install
npm start  # Test with regular server
# Or use Vercel CLI:
vercel dev
```

## Notes

- **Security**: The MongoDB connection string with credentials is currently hardcoded in `app.js`. This should be moved to environment variables before deployment (see Security Considerations section above).
- Serverless functions have cold start times, so the first request after a period of inactivity may be slower.
- Static files in the `public` directory will be served correctly through the Express middleware.
- EJS views will work as expected since they're rendered server-side.
