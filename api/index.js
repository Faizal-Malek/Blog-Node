const { app } = require("../app");
const { initDatabase } = require("../db");

let initPromise;

module.exports = async (req, res) => {
  try {
    if (!initPromise) {
      initPromise = initDatabase();
    }

    await initPromise;
    return app(req, res);
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.end("Database connection failed.");
  }
};
