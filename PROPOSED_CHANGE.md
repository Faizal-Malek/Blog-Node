# Proposed Changes for Vercel Deployment

## Overview
This PR adds support for deploying the Express/EJS blog application to Vercel as a serverless function. The changes are **additive and non-destructive** - no existing functionality is removed or modified.

## Files Added

### 1. `api/index.js` - Serverless Wrapper
This file wraps the Express application with `serverless-http` to make it compatible with Vercel's serverless architecture.

**What it does:**
- Attempts to load your Express app from common paths: `../app`, `../server`, `../src/app`, `../src/server`, `./app`
- Wraps the app with `serverless-http` for serverless execution
- Provides helpful error messages if the app can't be found or is misconfigured

**Important:** If your app is at a different location, modify this file to require from the correct path.

### 2. `vercel.json` - Vercel Configuration
Configures the Vercel deployment:
- Specifies Node.js 18.x runtime for the serverless function
- Rewrites all incoming routes to `/api/index.js` so the Express app handles routing

### 3. This file (`PROPOSED_CHANGE.md`)
Documents the changes for maintainers.

## Files Modified

### `package.json`
Added dependency: `"serverless-http": "^3.0.0"`

This package wraps Express apps to work as serverless functions.

## Important: App Export vs Server Instance

For Vercel serverless deployment to work, your main application file must:
1. **Export the Express app instance** (not a server)
2. **NOT call `app.listen()`** in the exported module

### Current Structure (app.js)
Your current `app.js` calls `app.listen(3000)` inside the mongoose connection promise. This works for traditional server deployment but not for serverless.

### Recommended Structure for Vercel

**Option 1: Modify app.js to export the app**

Create a new `server.js` for local development:

```javascript
// server.js (for local development)
const app = require('./app');
const mongoose = require('mongoose');

const dbURI = "mongodb+srv://netninja:test1234@nodeproject.62tovra.mongodb.net/NodeProject?retryWrites=true&w=majority&appName=NodeProject";

mongoose
  .connect(dbURI)
  .then((result) => {
    console.log('Connected to MongoDB');
    app.listen(3000, () => {
      console.log('Server running on http://localhost:3000');
    });
  })
  .catch((err) => console.error(err));
```

And modify `app.js` to just export the app:

```javascript
// app.js (modified - remove app.listen, just export)
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const blogRoutes = require("./routes/blogsRoutes");

const app = express();

// Connection string
const dbURI = "mongodb+srv://netninja:test1234@nodeproject.62tovra.mongodb.net/NodeProject?retryWrites=true&w=majority&appName=NodeProject";

// Connect to MongoDB (but don't start server here)
mongoose
  .connect(dbURI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error(err));

// Middleware & static files
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// View engine
app.set("view engine", "ejs");

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

// Export the app for Vercel
module.exports = app;
```

**Option 2: Keep app.js as-is and create a new entry point**

If you want to keep `app.js` unchanged for compatibility, you could:
1. Rename current `app.js` to `server.js`
2. Create a new `app.js` that only exports the Express app without calling listen()
3. Update `package.json` start script to use `server.js`

## Local Development

After making changes:

```bash
# Install dependencies
npm install

# For local development (if you created server.js)
npm start
# or
node server.js

# For testing Vercel locally (requires Vercel CLI)
npm install -g vercel
vercel dev
```

## Deployment on Vercel

After merging this PR:
1. Push to your repository
2. Vercel will automatically install dependencies (including `serverless-http`)
3. Vercel will build and deploy using the configuration in `vercel.json`
4. All routes will be handled by the Express app through `/api/index.js`

## Environment Variables

If your app uses environment variables (like the MongoDB connection string), make sure to:
1. Add them in the Vercel dashboard under Project Settings → Environment Variables
2. Never commit sensitive credentials to the repository

## Troubleshooting

### 404 Errors
- Ensure `vercel.json` is in the root directory
- Check that `api/index.js` successfully loads your app (check Vercel logs)

### 500 Errors
- Check Vercel runtime logs for error messages
- Ensure your app exports the Express instance, not a server instance
- Verify MongoDB connection string is set as an environment variable

### Module Not Found
- If `api/index.js` can't find your app, modify the `possiblePaths` array to include your app's actual path

## Testing Checklist

- [ ] Install dependencies: `npm install`
- [ ] Test locally: `node server.js` (if created)
- [ ] Test with Vercel CLI: `vercel dev`
- [ ] Deploy to Vercel and check deployment logs
- [ ] Test routes: home, about, blog pages
- [ ] Check for any 404 or 500 errors

## Questions or Issues?

If you encounter problems:
1. Check Vercel build logs for errors
2. Check Vercel runtime logs for runtime errors
3. Verify the Express app structure matches the recommended format
4. Open an issue with specific error messages for further assistance
