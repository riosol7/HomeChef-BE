const mongoose = require("mongoose")
const express = require("express");
const User = require("../models/User")
const Chef = require("../models/Chef")
const Item = require("../models/Item")
const Order = require("../models/Order")
const userController = require("express").Router({ mergeParams: true });
const { createUserToken, requireToken } = require("../middleware/auth")

//READ - grab cart - WORKING? TBD
// userController.get("/cart", async (req, res) => {
//     try{
//         console.log("User", req.params.Uid)
//         const id = req.params.Uid
//         const getUser = await User.findById(id)
//         const getCart = getUser.cart
//         console.log("getCart", getCart)
//         const grabItemId = getCart.map(item => item.itemId)
//         console.log("grabItemId:",grabItemId)
//         const listItems = await Item.find({_id:grabItemId})
//         console.log("listItems: ",listItems)
//         const chefIds = listItems.map(item => item.chef)
//         console.log("chefIds:", chefIds)
//         const listChef = await Chef.find({_id:chefIds})
//         console.log('listChef:',listChef)
//         const chefIdArr = listChef.map(chef => chef._id)
//         const chefNameArr = listChef.map(chef => chef.name)
//         const chefName = chefNameArr[0]
//         const chefId = chefIdArr[0] 
//         const receipt = listItems.concat(getCart)
//         console.log('receipt:',receipt)
//         res.status(200).json(receipt)
//     } catch (err) {
//         res.status(400).json({ error: err.message })
//     }
// })

//READ - get Orders
userController.get("/order", async (req, res) => {
    try{

    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

// CREATE - User creates an order pertaining all information:
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

//UPDATE - user adds item to their cart (NEEDS UPDATE: match cart.item._ids add qty)
userController.put("/cart", async (req, res) => {
    try{
        const id = req.params.Uid 
        const itemId = req.body.item._id
        console.log("Item id:",itemId)
        const foundItem = await Item.findById(itemId)
        console.log("found Item",foundItem)
        const foundUser = await User.findOneAndUpdate({_id:id}, {
            $push: { 
                "cart": { 
                    "item": foundItem, 
                    "qty": req.body.qty 
                }
            }
        },{ "new": true }).populate("cart").exec();
        console.log(foundUser, "found User")
        res.status(200).json(foundUser)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
});


//UPDATE - User removes item from their cart (Currently removes item if all matching criteria)
// NEED to change so qty gets subtracted
userController.put('/cart/:id', async (req, res) => {
    try {
        console.log("User:", req.params.Uid)
        console.log("Body:", req.body)
        const id = req.params.Uid
        const itemId = req.body._id || req.params.id
        console.log("itemId:", itemId)
        const foundItem = await Item.findById(itemId)
        console.log("foundItem:", foundItem)
        const foundUser = await User.findOneAndUpdate({_id:id }, {
            $pull: { 
                "cart": {
                    "item":foundItem,
                    "qty":req.body.qty
                }
            }
        }, {new: true})
        res.status(200).json(foundUser)
        console.log("foundUser:", foundUser)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

module.exports = userController