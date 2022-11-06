const dotenv = require("dotenv");
dotenv.config(); // loads enviroment variables into process.env

const app = require("./app");
const connectToMongoDB = require("./config/db");

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || "localhost";

connectToMongoDB(); // connects to a MongoDB server

// listens for connections
app.listen(PORT, HOST, () => {
  console.log(`Server started at port, ${PORT}...`);
});
