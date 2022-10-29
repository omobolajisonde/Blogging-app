const mongoose = require("mongoose");

const DATABASE_URL = process.env.DATABASE_URL;

module.exports = function () {
  mongoose.connect(DATABASE_URL);
  mongoose.connection.on("connected", () => {
    console.log("connected to mongoDB successfully...");
  });
  mongoose.connection.on("error", (err) => {
    console.log("connection to mongoDB failed...", err);
  });
};
