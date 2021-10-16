const User = require("../models/User");
const Chef = require("../models/Chef");
const Order = require("../models/Order");
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

//READ - get orders pertaining to chef items -TBD
chefController.get("/order", async (req, res) => {
    try{
        const id = req.params.Uid
        const getChef = await Chef.findOne({user:id})
        console.log('getChef:', getChef)
        const chefItems = getChef.items
        console.log('chefItems:', chefItems)
        // const orderItems = await Order.find(items.map(item => { item.item }))
        // console.log('orderItems', orderItems)
        // const getOrder = orderItems.filter(items => items._)
        res.status(200).json()
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