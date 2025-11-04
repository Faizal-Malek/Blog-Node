const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const blogRoutes = require("./routes/blogsRoutes");

//express app
const app = express();

//Connection string of MongoDB
const dbURI =
  "mongodb+srv://netninja:test1234@nodeproject.62tovra.mongodb.net/NodeProject?retryWrites=true&w=majority&appName=NodeProject";

// Connect to MongoDB
mongoose
  .connect(dbURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error(err));

//register view engine
app.set("view engine", "ejs");
// app.set('views', 'myViews')//making a new folder as the ejs view

//listing for request

//--------------------------------------middleware & static files-------------------------
app.use(express.static("public"));
//in other words this method works like  case statement so if there is no match it continues going to the next url redirect and the 404 method
//  should be placed last to as it will run regardless if there is no match for every request
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  //   res.send("<p>Home Page</p>");
  res.redirect("/blogs");
});

app.get("/about", (req, res) => {
  //   res.send("<p>About Page</p>");
  res.render("about", { title: "about" });
});

//these are the blog routes
app.use("/blogs", blogRoutes);

app.use((req, res) => {
  res.status(404).render("404", { title: "404" });
});

// Only start server if running directly (not in serverless environment)
if (require.main === module) {
  app.listen(3000, () => console.log('Server running on port 3000'));
}

// Export the app for Vercel serverless function
module.exports = app;
