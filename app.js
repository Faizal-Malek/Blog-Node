const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const blogRoutes = require("./routes/blogsRoutes");

//express app
const app = express();

const port = process.env.PORT || 3000;
const dbURI = process.env.MONGODB_URI;

if (!dbURI) {
  console.error("Missing MONGODB_URI environment variable.");
  process.exit(1);
}

const connectToDatabase = () =>
  mongoose.connect(dbURI).catch((err) => {
    console.error(err);
    throw err;
  });

if (require.main === module) {
  connectToDatabase()
    .then(() => app.listen(port))
    .catch(() => process.exit(1));
}

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

module.exports = { app, connectToDatabase };
