const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const Blog = require("./models/blog");

//express app
const app = express();

//Connection string of MongoDB
const dbURI =
  "mongodb+srv://netninja:test1234@nodeproject.62tovra.mongodb.net/NodeProject?retryWrites=true&w=majority&appName=NodeProject";

mongoose
  .connect(dbURI)
  .then((result) => app.listen(3000))
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
app.get("/blogs", (req, res) => {
  Blog.find()
    .sort({ createdAt: -1 })
    .then((result) => {
      res.render("index", { title: "All Blogs", blogs: result });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/blogs", (req, res) => {
  console.log(req.body);
  const blog = new Blog(req.body);
  blog
    .save()
    .then((result) => {
      res.redirect("/blogs");
    })
    .catch((err) => {
      console.error(err);
    });
});

app.delete("/blogs/:id", (req, res) => {
  const id = req.params.id;
  Blog.findByIdAndDelete(id)
    .then((result) => {
      res.json({ redirect: "/blogs" });
    })
    .catch((err) => {
      console.error(err);
    });
});
app.put("/Blog/create/:id", (req, res) => {
  const id = req.params.id;
  console.log("update this blog: " + id);
  Blog.findByIdAndUpdate(id)
    .then((result) => {
      res.json({ redirect: "/blogs" });
    })
    .catch((err) => {
      console.error(err);
    });
});

app.get("/blogs/create", (req, res) => {
  res.render("create", { title: "create a new Blog" });
});

app.get("/blogs/:id", (req, res) => {
  const id = req.params.id;
  Blog.findById(id)
    .then((result) => {
      res.render("details", { blog: result, title: "Blog Details" });
    })
    .catch((err) => {
      console.error(err);
    });
});

//404 page
app.use((req, res) => {
  res.status(404).render("404", { title: "404" });
});



// skipping this app.use method by using using next and calling it in the use method
// app.use((req, res, next) => {
//   console.log("new request made: ");
//   console.log("host:", req.hostname);`
//   console.log("path:", req.path);
//   console.log("Method:", req.method);
//   next();
// });

// //adding a blog to the database
// app.get("/add-blog", (req, res) => {
//   const blog = new Blog({
//     title: "New Blog",
//     snippet: "About my new blog",
//     body: "this is about my new blog"
//   });
//   blog
//     .save()
//     .then((result) => {
//       res.send(result);
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// });

// //getting all blogs from the database
// app.get("/get-all", (req, res) => {
//   Blog.find()
//     .then((result) => {
//       res.send(result);
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// });

// //finding  a single blog from the database
// app.get("/find-one", (req, res) => {
//   Blog.findById("66301bdba8dba376e5dd0525")
//     .then((result) => {
//       res.send(result);
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// });
