const mongoose = require("mongoose");

// Error / Disconnection
mongoose.connection.on("error", (err) =>
  console.log(err.message + " is Mongod not running?")
);
mongoose.connection.on("disconnected", () => console.log("mongo disconnected"));

// How to connect to the database either via heroku or locally
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/homechef";
// Connection string (we will be replacing this later with environmental variables)
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.once("open", () => {
  console.log("connected to mongoose...");
});
