const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");
const connectToMongoDB = require("./config/db");

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || "localhost";

connectToMongoDB();

app.listen(PORT, HOST, () => {
  console.log(`Server started at port, ${PORT}...`);
});
