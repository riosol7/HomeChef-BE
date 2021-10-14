const User = require("../models/User");
const Chef = require("../models/Chef");
const chefController = require("express").Router({ mergeParams: true });
const { createUserToken, requireToken } = require("../middleware/auth");

//READ
chefController.get("/", async (req, res) => {
    try{
        const getChef = await Chef.find()
        res.status(200).json(getChef)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

//CREATE
chefController.post("/", async (req, res) => {
    try{
        const newChef = await Chef.create(req.body)
        res.status(200).json(newChef)
    } catch (err) {
        res.status(400).json({ error: err.message});
    }
});

module.exports = chefController