// =============================
//         DEPENDENCIES
// =============================
const express = require("express");
const app = express();
const methodOverride = require("method-override");
const cors = require("cors");
const passport = require("passport");
require("./db/db")

const PORT = process.env.PORT || 9999;

// =============================
//         CONTROLLERS
// =============================
const authController = require("./controllers/auth");
app.use("/auth", authController);

const User = require("./models/User");

// =============================
//         MIDDLEWARE
// =============================
const whiteList = ["http://localhost:3000"];

const corsOptions = {
    origin: (origin, callback) => {
        if (whiteList.indexOf(origin) !== -1 || !origin || 1==1) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by Cors"));
        }
    },
};
app.use(methodOverride("_method"));
app.use(cors(corsOptions));
app.use(express.json());
app.use(passport.initialize());
// =============================
//         ROUTER
// =============================
app.post("/register", (req, res) => {
    User.create(req.body, (err, createdUser) => {
      if (err) {
        res.send(err);
      } else {
        res.send(createdUser);
      }
    });
  });

app.listen(PORT, () => {
    console.log(`HomeChef running on port ${PORT}`)
})
