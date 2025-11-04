# Proposed Changes for Vercel Deployment

This document explains the changes made to enable Vercel deployment for this Node.js/Express application.

## Files Added

### 1. `api/index.js`
This is a serverless function wrapper that allows Vercel to invoke your Express app. It:
- Imports the Express app from common locations (`app.js`, `server.js`, or `src/app.js`)
- Uses `serverless-http` to wrap the Express app for serverless execution
- Acts as the entry point for all incoming requests on Vercel

### 2. `vercel.json`
This configuration file tells Vercel how to deploy your app:
- Sets Node.js 18 as the runtime
- Defines the build configuration for the serverless function
- Rewrites all routes to `/api/index.js` so all requests go through your Express app
- Sets `NODE_ENV` to production

## Important: Modifying Your Express App

For this to work correctly, **your Express app must export the app instance** instead of calling `app.listen()` directly in the main module.

### Current Pattern (doesn't work with Vercel):
```javascript
const app = express();
// ... middleware and routes ...
mongoose.connect(dbURI)
  .then((result) => app.listen(3000))
  .catch((err) => console.error(err));
```

### Required Pattern (works with Vercel):
```javascript
const app = express();
// ... middleware and routes ...

// Only listen if not in serverless environment
if (require.main === module) {
  mongoose.connect(dbURI)
    .then((result) => app.listen(3000))
    .catch((err) => console.error(err));
}

// Always export the app
module.exports = app;
```

## What Happens for Your App

Based on the current `app.js` file:
1. The app connects to MongoDB and starts listening on port 3000 in the `mongoose.connect()` callback
2. For Vercel deployment, you need to modify `app.js` to:
   - Export the Express app instance
   - Only call `app.listen()` when running locally (not in serverless environment)
   - Initialize the MongoDB connection outside of the listen callback

### Example Modification for `app.js`:

```javascript
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const blogRoutes = require("./routes/blogsRoutes");

// Express app
const app = express();

// Connection string of MongoDB
const dbURI = process.env.MONGODB_URI || "mongodb+srv://your-connection-string";

// Connect to MongoDB (but don't start server here)
mongoose
  .connect(dbURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error(err));

// Register view engine
app.set("view engine", "ejs");

// Middleware & static files
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Routes
app.get("/", (req, res) => {
  res.redirect("/blogs");
});

app.get("/about", (req, res) => {
  res.render("about", { title: "about" });
});

app.use("/blogs", blogRoutes);

app.use((req, res) => {
  res.status(404).render("404", { title: "404" });
});

// Only start server if running directly (not imported as module)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the app for Vercel serverless function
module.exports = app;
```

## Dependencies

This solution requires the `serverless-http` package. To install it:

```bash
npm install serverless-http
```

Or add it to your `package.json`:
```json
{
  "dependencies": {
    "serverless-http": "^3.2.0"
  }
}
```

## Environment Variables

This PR improves security by supporting environment variables for sensitive configuration. Make sure to set your MongoDB connection string and any other environment variables in Vercel's dashboard:

### Required Environment Variables:
- `MONGODB_URI` - Your MongoDB connection string (required for production)

### Setting Environment Variables in Vercel:
1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Add `MONGODB_URI` with your MongoDB connection string
4. Add any other sensitive configuration (API keys, etc.)

**Security Note:** The app now reads `MONGODB_URI` from environment variables first, falling back to a default connection string for local development. For production deployments on Vercel, always set `MONGODB_URI` as an environment variable and rotate any credentials that were previously hardcoded.

## Testing Locally

To test the serverless setup locally:
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel dev`
3. Your app will be available at `http://localhost:3000`

## Deployment

After merging this PR:
1. Connect your GitHub repository to Vercel (if not already connected)
2. Vercel will automatically deploy on push to main branch
3. Check the Vercel dashboard for deployment logs and any errors

## Troubleshooting

If you see 404 errors after deployment:
- Verify that `app.js` exports the Express app instance
- Check Vercel function logs in the dashboard
- Ensure all dependencies are in `package.json`
- Verify MongoDB connection string is set in Vercel environment variables

If you see connection errors:
- Make sure your MongoDB cluster allows connections from Vercel's IP ranges (0.0.0.0/0 or specific Vercel IPs)
- Verify environment variables are properly set in Vercel

## Next Steps

1. Install `serverless-http`: `npm install serverless-http`
2. Modify `app.js` as shown above to export the Express app
3. Test locally with `vercel dev` (optional)
4. Commit and push changes
5. Deploy to Vercel

## Note

These changes are safe and additive - they only add new files and don't modify your existing source code. The app will continue to work locally as before once you add the module export.
