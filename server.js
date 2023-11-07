const dotenv = require("dotenv");
dotenv.config(); // loads enviroment variables into process.env
const logger = require("./logger/logger");
// Handling *uncaught exceptions*
// process.on("uncaughtException", (err) => {
//   console.log(err.name, err.message);
//   console.log("Uncaught Exception! shutting down...");
//   process.exit(1);
// });
const app = require("./app");
const connectToMongoDB = require("./config/db");

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || "localhost";

connectToMongoDB(); // connects to a MongoDB server

// listens for connections
const server = app.listen(PORT, HOST, () => {
  logger.log({ level: "info", message: `Server started at port, ${PORT}...` });
});

// Handling *unhandled promise rejections*
// process.on("unhandledRejection", (err) => {
//   console.log(err.name, err.message);
//   console.log("Unhandled Rejection! shutting down...");
//   server.close(() => {
//     process.exit(1);
//   });
// });
