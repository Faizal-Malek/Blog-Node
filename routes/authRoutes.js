const express = require("express");
const {
  login_get,
  login_post,
  logout_post,
  require_auth
} = require("../controllers/authController");
const { dashboard_get } = require("../controllers/dashboardController");

const router = express.Router();

router.get("/login", login_get);
router.post("/login", login_post);
router.post("/logout", logout_post);
router.get("/dashboard", require_auth, dashboard_get);

module.exports = router;
