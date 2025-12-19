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
    res.status(500).render("500", { title: "Server Error" });
  }
};

const blog_details = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(404).render("404", { title: "404" });
  }

  try {
    await query("INSERT INTO blog_views (blog_id) VALUES ($1)", [id]);
    const { rows } = await query(
      "SELECT id, title, snippet, body, created_at FROM blogs WHERE id = $1",
      [id]
    );

    if (!rows.length) {
      return res.status(404).render("404", { title: "404" });
    }

    const [{ rows: viewRows }, { rows: likeRows }] = await Promise.all([
      query("SELECT COUNT(*)::int AS total FROM blog_views WHERE blog_id = $1", [
        id
      ]),
      query("SELECT COUNT(*)::int AS total FROM blog_likes WHERE blog_id = $1", [
        id
      ])
    ]);

    return res.render("details", {
      blog: rows[0],
      title: "Blog Details",
      stats: {
        views: viewRows[0]?.total || 0,
        likes: likeRows[0]?.total || 0
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).render("500", { title: "Server Error" });
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
    res.status(500).render("500", { title: "Server Error" });
  }
};

const blog_delete = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid blog id." });
  }

  try {
    await query("DELETE FROM blog_likes WHERE blog_id = $1", [id]);
    await query("DELETE FROM blog_views WHERE blog_id = $1", [id]);
    await query("DELETE FROM blogs WHERE id = $1", [id]);
    return res.json({ redirect: "/blogs" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to delete blog." });
  }
};

const blog_like_post = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid blog id." });
  }

  try {
    await query("INSERT INTO blog_likes (blog_id) VALUES ($1)", [id]);
    const { rows } = await query(
      "SELECT COUNT(*)::int AS total FROM blog_likes WHERE blog_id = $1",
      [id]
    );
    return res.json({ likes: rows[0]?.total || 0 });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to like blog." });
  }
};

module.exports = {
  blog_index,
  blog_details,
  blog_create_get,
  blog_create_post,
  blog_delete,
  blog_like_post
};
