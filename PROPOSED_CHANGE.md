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

### Current Issue
The current `app.js` file calls `app.listen()` directly within the mongoose connection callback:

```javascript
mongoose
  .connect(dbURI)
  .then((result) => app.listen(3000))
  .catch((err) => console.error(err));
```

### Recommended Solution
To make the app work with the serverless adapter, the app should be **exported** instead of calling `listen()`. Here are two approaches:

#### Option 1: Export app directly and create separate server.js
Modify `app.js` to export the app after mongoose connection setup:

```javascript
// At the end of app.js, remove the app.listen() call and add:
mongoose
  .connect(dbURI)
  .then((result) => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => console.error(err));

// Export the app for serverless
module.exports = app;
```

Then create a new `server.js` for local development:

```javascript
const app = require('./app');
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

#### Option 2: Conditional export
Modify `app.js` to conditionally export or listen based on environment:

```javascript
mongoose
  .connect(dbURI)
  .then((result) => {
    console.log('Connected to MongoDB');
    // Only listen if not in serverless environment
    if (require.main === module) {
      app.listen(3000, () => {
        console.log('Server running on port 3000');
      });
    }
  })
  .catch((err) => console.error(err));

module.exports = app;
```

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
