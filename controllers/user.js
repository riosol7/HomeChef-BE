const mongoose = require("mongoose")
const express = require("express");
const User = require("../models/User")
const Chef = require("../models/Chef")
const Item = require("../models/Item")
const Order = require("../models/Order")
const userController = require("express").Router({ mergeParams: true });
const { createUserToken, requireToken } = require("../middleware/auth");

// =============================
//         READ
// =============================
// -- Grab cart --
userController.get("/cart", async (req, res) => {
    try{
        const id = req.params.Uid
        const getUser = await User.findById(id)
        const getCart = getUser.cart
        console.log("getCart:", getCart)
        res.status(200).json(getCart)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

// -- Get user's order(s) --
userController.get("/order", async (req, res) => {
    try{
        const orders = await Order.find(
            {"user.userId":req.params.Uid}
        )
        console.log('orders:',orders)
        res.status(200).json(orders)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

// -- Find user --
userController.get("/", async (req, res) => {
    try{
        const user = await User.findById(req.params.Uid)
        console.log("user:", user)
        res.status(200).json(user)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

// =============================
//         CREATE
// =============================
// -- User creates an order pertaining all listed information: -- WIP
// Item duplicates?
userController.post("/order", async (req, res) => {
    try{
        console.log("User:", req.params.Uid)
        console.log("Body:", req.body)
        const id = req.params.Uid
        const getUser = await User.findById(id)
        const getCart = getUser.cart
        console.log("getCart:", getCart)

        const listChefIds = getCart.map(cart => cart.item.chef)
        console.log('listChefIds:', listChefIds)
        const chefs = await Chef.find({_id:listChefIds})
        console.log('chefs:', chefs)

        const pullCart = await User.findOneAndUpdate(
            {_id:id},
            {
                $pullAll: { 
                    "cart": getCart 
                }
            }, 
            {
                new:true,
                multi:true
            }
        )
        console.log("pullCart:", pullCart)

        const userInfo = await Order.create(req.body)
        console.log('userInfo:',userInfo)
        const newOrder = await Order.findOneAndUpdate(
            {"user.userId":req.body.user.userId},
            {
                $push: {
                    "items":getCart,
                    "chefs":chefs
                }
            },
            {new:true}
        )
        console.log('newOrder:',newOrder)

        res.status(200).json(newOrder)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

// =============================
//         UPDATE
// =============================
// -- User edits --
userController.put("/", async (req, res) => {
    try{
        const updatedUser = await User.findByIdAndUpdate(
            req.params.Uid,
            req.body,
            {new:true}
        )
        console.log("updatedUser:",updatedUser)
        res.status(200).json(updatedUser)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

// -- User adds item to their cart (NEEDS UPDATE: match cart.item._ids add qty) -- WIP
userController.put("/cart", async (req, res) => {
    try{
        const id = req.params.Uid 
        const itemId = req.body.item._id
        console.log("Item id:",itemId)
        const foundItem = await Item.findById(itemId)
        console.log("found Item",foundItem)
        const foundUser = await User.findOneAndUpdate(
            {_id:id}, 
            {
                $push: { 
                    "cart": {
                        "_id": foundItem._id, 
                        "item": foundItem, 
                        "qty": req.body.qty 
                    }
                }
            },
            { "new": true }
        ).populate("cart").exec();
        console.log(foundUser, "found User")
        res.status(200).json(foundUser)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
});


// -- User removes item from their cart (Currently removes item if all matching criteria) --
// NEED to change so qty gets subtracted -- WIP
userController.put('/cart/:id', async (req, res) => {
    try {
        console.log("User:", req.params.Uid)
        console.log("Body:", req.body)
        const id = req.params.Uid
        const itemId = req.body._id || req.params.id
        console.log("itemId:", itemId)
        const foundItem = await Item.findById(itemId)
        console.log("foundItem:", foundItem)
        const foundUser = await User.findOneAndUpdate(
            {_id:id}, 
            {
                $pull: { 
                    "cart": {
                        "_id": foundItem._id,
                        "item": foundItem,
                        "qty": req.body.qty
                    }
                }
            }, 
            {new: true}
        )
        res.status(200).json(foundUser)
        console.log("foundUser:", foundUser)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

// =============================
//         DELETE
// =============================
// -- User deleted -- WIP
// UPDATE : WIP once deleted, any relation to chef => item must also be deleted
// OTHER users that contain associated items in their cart must also be removed
userController.delete("/", async (req, res) => {
    try{
        const id = req.params.Uid
        const deletedUser = await User.findOneAndRemove(id)
        console.log("deletedUser:",deletedUser)
        const deletedChef = await Chef.findOneAndRemove(id)
        console.log("deletedChef:",deletedChef)
        //DELETE associating items to chef
        //WORKS?? 
        const deletedItem = await Item.deleteMany(
            {
                chef:{
                    $in:[
                        deletedChef._id
                    ]
                }
            }
        )
        console.log('deletedItem:', deletedItem)
        res.status(200).json(deletedUser)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

// -- User deletes order --
userController.delete("/order/:id", async (req, res) => {
    try{
        const orderId = req.params.id
        const deletedOrder = await Order.findByIdAndRemove(orderId)
        console.log('deletedOrder:', deletedOrder)
        res.status(200).json(deletedOrder)
    } catch (err) {
        res.status(400).json({ error:err.message })
    }
})


module.exports = userController