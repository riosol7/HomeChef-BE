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
//         CORS/MIDDLEWARE
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
//         CONTROLLERS
// =============================
const authController = require("./controllers/auth");
const customerController = require("./controllers/customer");
const chefController = require("./controllers/chef")

const User = require("./models/User");
const Customer = require("./models/Customer")
const Chef = require("./models/Chef")

app.use("/auth", authController);
app.use("/customer", customerController);
app.use("/chef", chefController);
// =============================
//         ROUTER
// =============================
app.get("/", async (req, res) => {
    try{
        const foundUsers = await User.find()
        res.status(200).json(foundUsers)
    } catch (err){
        res.status(400).json({
            error: err.message
        })
    }
})

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
