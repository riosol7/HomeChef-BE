const express = require("express");
const User = require("../models/User")
const Item = require("../models/Item")
const Order = require("../models/Order")
const userController = require("express").Router({ mergeParams: true });
const { createUserToken, requireToken } = require("../middleware/auth")

//CREATE - add items to the cart -TBD
userController.post("/", async (req, res) => {
    try{
        const uid = (req.user && req.user.id) || req.body._id
        const itemId = (req.item && req.item.id) || req.body.itemId
        const foundItemId = await Item.findById(itemId)
        const addToCart = await User.create(req.body)
        const foundUserCart = await User.findById(uid).populate("cart").exec();
        foundUserCart.cart.push(addToCart)
        await foundUserCart.save()
        res.status(200).json()
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
});

module.exports = userController