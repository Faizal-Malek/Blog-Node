const express = require("express");
const morgan = require("morgan");
const blogRoutes = require("./routes/blogsRoutes");
const { initDatabase } = require("./db");

//express app
const app = express();

const port = process.env.PORT || 3000;

if (require.main === module) {
  initDatabase()
    .then(() => app.listen(port))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
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
app.use(express.json());
app.use(morgan("dev"));
app.use((req, res, next) => {
  const cookieHeader = req.headers.cookie || "";
  req.cookies = cookieHeader.split(";").reduce((cookies, part) => {
    const [key, ...rest] = part.trim().split("=");
    if (!key) {
      return cookies;
    }
    cookies[key] = decodeURIComponent(rest.join("="));
    return cookies;
  }, {});
  next();
});

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
app.use(authRoutes);

app.use((req, res) => {
  res.status(404).render("404", { title: "404" });
});

module.exports = { app };
