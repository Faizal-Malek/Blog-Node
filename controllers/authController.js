const { query } = require("../db");
const { createSessionToken, verifyPassword } = require("../auth");

const sessions = new Map();

const login_get = (req, res) => {
  res.render("login", { title: "Login" });
};

const login_post = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).render("login", {
      title: "Login",
      error: "Email and password are required."
    });
  }

  try {
    const { rows } = await query(
      "SELECT id, email, password_hash, password_salt FROM users WHERE email = $1",
      [email]
    );

    if (!rows.length) {
      return res.status(401).render("login", {
        title: "Login",
        error: "Invalid credentials."
      });
    }

    const user = rows[0];
    const ok = verifyPassword(password, user.password_salt, user.password_hash);
    if (!ok) {
      return res.status(401).render("login", {
        title: "Login",
        error: "Invalid credentials."
      });
    }

    const token = createSessionToken();
    sessions.set(token, { id: user.id, email: user.email });

    res.setHeader(
      "Set-Cookie",
      `session=${token}; HttpOnly; Path=/; SameSite=Lax`
    );
    return res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    return res.status(500).render("500", { title: "Server Error" });
  }
};

const logout_post = (req, res) => {
  const token = req.cookies.session;
  if (token) {
    sessions.delete(token);
  }
  res.setHeader(
    "Set-Cookie",
    "session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax"
  );
  return res.redirect("/login");
};

const require_auth = (req, res, next) => {
  const token = req.cookies.session;
  if (!token || !sessions.has(token)) {
    return res.redirect("/login");
  }
  req.user = sessions.get(token);
  return next();
};

module.exports = {
  login_get,
  login_post,
  logout_post,
  require_auth
};
