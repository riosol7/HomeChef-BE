// =============================
//         DEPENDENCIES
// =============================
require("./db/db")
require("dotenv").config()
const express = require("express");
const app = express();
const methodOverride = require("method-override");
const cors = require("cors");
const passport = require("passport");

// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

const PORT = process.env.PORT || 9999;

// =============================
//         CORS/MIDDLEWARE
// =============================
const whiteList = ["http://localhost:3000", "https://homechef-be.herokuapp.com" ];

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
const chefController = require("./controllers/chef");
const itemController = require("./controllers/item");
const userController = require("./controllers/user")

const User = require("./models/User");
const Chef = require("./models/Chef");
const Item = require("./models/Item");

app.use("/auth", authController);
app.use("/:Uid", userController); 
app.use("/:Uid/chef", chefController);
app.use("/:Uid/item", itemController);   
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
