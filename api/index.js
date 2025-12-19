const { app, connectToDatabase } = require("../app");

let connectionPromise;

module.exports = async (req, res) => {
  if (!connectionPromise) {
    connectionPromise = connectToDatabase();
  }

  await connectionPromise;
  return app(req, res);
};
