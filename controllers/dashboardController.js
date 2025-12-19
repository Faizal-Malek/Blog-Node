const { query } = require("../db");

const dashboard_get = async (req, res) => {
  try {
    const [{ rows: postRows }, { rows: viewRows }, { rows: likeRows }] =
      await Promise.all([
        query("SELECT COUNT(*)::int AS total FROM blogs"),
        query("SELECT COUNT(*)::int AS total FROM blog_views"),
        query("SELECT COUNT(*)::int AS total FROM blog_likes")
      ]);

    const { rows: topPosts } = await query(
      `
        SELECT
          blogs.id,
          blogs.title,
          COUNT(blog_views.id)::int AS views
        FROM blogs
        LEFT JOIN blog_views ON blog_views.blog_id = blogs.id
        GROUP BY blogs.id
        ORDER BY views DESC
        LIMIT 5
      `
    );

    res.render("dashboard", {
      title: "Dashboard",
      stats: {
        totalPosts: postRows[0]?.total || 0,
        totalViews: viewRows[0]?.total || 0,
        totalLikes: likeRows[0]?.total || 0
      },
      topPosts
    });
  } catch (err) {
    console.error(err);
    res.status(500).render("500", { title: "Server Error" });
  }
};

module.exports = { dashboard_get };
