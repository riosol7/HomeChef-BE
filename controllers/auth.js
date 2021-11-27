const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { createUserToken, requireToken } = require("../middleware/auth")

const router = express.Router();

const register = async (req, res, next) => {
    try{
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(req.body.password, salt);
        const pwStore = req.body.password;
        req.body.password = passwordHash;

        const newUser = await User.create(req.body);
        console.log(newUser);
        if(newUser) {
            req.body.password = pwStore;
            const authenticatedUserToken = createUserToken(req, newUser);
            res.status(201).json({
                user: newUser,
                isLoggedIn: true,
                token: authenticatedUserToken,
            });
        } else {
            res.status(400).json({ error: "Whoops, error?"})
        }
    } catch (err) {
        res.status(400).json({ error: err.message});
    }
};

const login = async (req, res) => {
    try{
        const loggingUser = req.body.user;
        const foundUser = await User.findOne({ user: loggingUser });
        const token = await createUserToken(req, foundUser);
        res.status(200).json({
            user: foundUser,
            isLoggedIn: true,
            token: token,
        });
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
}

router.get("/logout", async (req, res, next) => {
    try{
        const currentUser = req.user
        console.log("currentUser:",currentUser)
        delete req.user
        res.status(200).json({
            message: `${currentUser} is logged out!`,
            isLogged: false,
            token:"",
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
})




router.post('/register', register)
router.post('/login', login)
module.exports = router;