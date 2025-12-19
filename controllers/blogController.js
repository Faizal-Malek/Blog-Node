// create functions
///blog_index, blog_details, blog_create_get, blog_create_post, blog_delete
const { query } = require("../db");

const blog_index = async (req, res) => {
  try {
    const { rows } = await query(
      "SELECT id, title, snippet, body, created_at FROM blogs ORDER BY created_at DESC"
    );
    res.render("index", { title: "All Blogs", blogs: rows });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to load blogs.");
  }
};

const blog_details = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(404).render("404", { title: "404" });
  }

  try {
    const { rows } = await query(
      "SELECT id, title, snippet, body, created_at FROM blogs WHERE id = $1",
      [id]
    );

    if (!rows.length) {
      return res.status(404).render("404", { title: "404" });
    }

    return res.render("details", { blog: rows[0], title: "Blog Details" });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Failed to load blog.");
  }
};

const blog_create_get = (req, res) => {
  res.render("create", { title: "Create a new Blog" });
};

const blog_create_post = async (req, res) => {
  const { title, snippet, body } = req.body;
  try {
    await query(
      "INSERT INTO blogs (title, snippet, body) VALUES ($1, $2, $3)",
      [title, snippet, body]
    );
    res.redirect("/blogs");
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to create blog.");
  }
};

const blog_delete = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid blog id." });
  }

  try {
    await query("DELETE FROM blogs WHERE id = $1", [id]);
    return res.json({ redirect: "/blogs" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to delete blog." });
  }
};

module.exports = {
  blog_index,
  blog_details,
  blog_create_get,
  blog_create_post,
  blog_delete
};
