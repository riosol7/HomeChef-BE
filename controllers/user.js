const mongoose = require("mongoose")
const express = require("express");
const User = require("../models/User")
const Chef = require("../models/Chef")
const Item = require("../models/Item")
const Order = require("../models/Order")
const userController = require("express").Router({ mergeParams: true });
const { createUserToken, requireToken } = require("../middleware/auth")

//READ - grab cart
userController.get("/cart", async (req, res) => {
    try{
        console.log("User", req.params.Uid)
        const id = req.params.Uid
        const getUser = await User.findById(id)
        const getCart = getUser.cart
        console.log("getCart", getCart)
        const grabItemId = getCart.map(item => item.itemId)
        console.log("grabItemId:",grabItemId)
        const listItems = await Item.find({_id:grabItemId})
        console.log("listItems: ",listItems)
        const chefIds = listItems.map(item => item.chef)
        console.log("chefIds:", chefIds)
        const listChef = await Chef.find({_id:chefIds})
        console.log('listChef:',listChef)
        const chefIdArr = listChef.map(chef => chef._id)
        const chefNameArr = listChef.map(chef => chef.name)
        const chefName = chefNameArr[0]
        const chefId = chefIdArr[0] 
        const receipt = listItems.concat(getCart)
        console.log('receipt:',receipt)
        res.status(200).json(receipt)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

//READ - get Orders
userController.get("/order", async (req, res) => {
    try{

    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

//CREATE? - User creates an order, pull from cart items and set to order. Order contains info regarding user, chef, & order details items -TBD
//TBD
userController.post("/order", async (req, res) => {
    try{
        console.log("User:", req.params.Uid)
        console.log("Body:", req.body)
        // console.log("Body", req.body)
        const id = req.params.Uid
        // const itemId = (req.body.item && req.body.item.id) || req.body._id
        // const foundItem = await Item.findById(itemId)
        const getUser = await User.findById(id)
        const getCart = getUser.cart
        console.log("getCart:", getCart)
        const pullCart = await User.findOneAndUpdate({_id:id }, {
            "$pull" : { "cart": getCart }
        }, {new: true })
        console.log("pullCart:", pullCart)
        const grabItemId = getCart.map(item => item.itemId)
        console.log("grabItemId:",grabItemId)
        const listItems = await Item.find({_id:grabItemId})
        console.log("listItems: ",listItems)
        const chefIds = listItems.map(item => item.chef)
        console.log("chefIds:", chefIds)
        const listChef = await Chef.find({_id:chefIds})
        console.log('listChef:',listChef)
        const chefIdArr = listChef.map(chef => chef._id)
        const chefNameArr = listChef.map(chef => chef.name)
        const chefName = chefNameArr[0]
        const chefId = chefIdArr[0] 
        const userInfo = await Order.create(req.body)
        console.log('userInfo:', userInfo)
        const newOrder = await Order.findOneAndUpdate({}, {
            "$push" : { 
                "chefId": chefId,
                "chefName" : chefName,
                "items": getCart,
            }
        },{ "new": true }).populate('items', "chefId", "chefName").exec();
        console.log('new Order', newOrder)
        res.status(200).json(newOrder)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

//UPDATE - User adds item to their cart
userController.put("/cart", async (req, res) => {
    try{
        console.log("User", req.params.Uid)
        console.log("Body", req.body)
        const id = req.params.Uid 
        const itemId = (req.body.item && req.body.item.id) || req.body._id
        console.log("Item id",itemId)
        const foundItem = await Item.findById(itemId)
        // const addToCart = await User.create(req.body)
        console.log("found Item",foundItem)
        const foundUser = await User.findOneAndUpdate({_id:id}, {
            "$push": { "cart": req.body }
        },{ "new": true }).populate("cart").exec();
        console.log(foundUser, "found User")
        res.status(200).json(foundUser)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
});

//UPDATE - User adds item to their cart (NEW)
// userController.put("/cart", async (req, res) => {
//     try{
//         console.log("User", req.params.Uid)
//         console.log("Body", req.body)
//         const id = req.params.Uid 
//         const itemId = (req.body.item && req.body.item.id) || req.body._id
//         console.log("Item id",itemId)
//         const foundItem = await Item.findById(itemId)
//         // const addToCart = await User.create(req.body)
//         console.log("found Item",foundItem)
//         const foundUser = await User.findOneAndUpdate({_id:id}, {
//             "$push": { 
//                 "cart": { 
//                     itemId: foundItem, 
//                     qty: req.body 
//                 }
//             }
//         },{ "new": true }).populate("cart").exec();
//         console.log(foundUser, "found User")
//         res.status(200).json(foundUser)
//     } catch (err) {
//         res.status(400).json({ error: err.message })
//     }
// });

// NEED TO ADD qty if matching ids
// userController.put("/", async (req, res) => {
//     try{
//         console.log('testing')
//         console.log("User", req.params.Uid)
//         console.log("Body", req.body)
//         const id = req.params.Uid 
//         const itemId = (req.body.item && req.body.item.id) || req.body._id
//         console.log("Item id",itemId)
//         const foundItem = await Item.findById(itemId)
//         // const addToCart = await User.create(req.body)
//         console.log("found Item",foundItem)
//         const foundUser = await User.findOneAndUpdate({_id:id}, {
//             "$group":{ "$sum" : "$qty" },
//             "$group":{ "$push": { "cart": req.body }}
//         },
//         { "new": true }).populate("cart").exec();
            
//         console.log(foundUser, "found User")
//         res.status(200).json()
//     } catch (err) {
//         res.status(400).json({ error: err.message })
//     }
// });

//UPDATE - User adds item to their cart
//OLD
// userController.put("/", async (req, res) => {
//     try{
//         console.log('testing')
//         console.log("User", req.params.Uid)
//         console.log("Body", req.body)
//         const id = req.params.Uid 
//         const itemId = (req.body.item && req.body.item.id) || req.body._id
//         console.log(itemId)
//         const foundItem = await Item.findById(itemId)
//         // const addToCart = await User.create(req.body)
//         console.log(foundItem)
//         const foundUser = await User.findById(id).populate("cart").exec();
//         console.log(foundUser, "testing User")
//         foundUser.cart.push(foundItem)
//         console.log(foundItem)
//         await foundUser.save()
//         res.status(200).json()
//     } catch (err) {
//         res.status(400).json({ error: err.message })
//     }
// });


//UPDATE - User removes item from their cart
userController.put('/cart/:id', async (req, res) => {
    try {
        console.log("User:", req.params.Uid)
        console.log("Body:", req.body)
        const id = req.params.Uid
        const itemId = (req.body.item && req.body.item.id) || req.body._id
        console.log("itemId:", itemId)
        const foundItem = await Item.findById(itemId || req.params.id)
        console.log("foundItem:", foundItem)
        const foundUser = await User.findOneAndUpdate({_id:id }, {
            "$pull": { "cart": {'itemId':itemId} }
        }, { new: true})
        res.status(200).json(foundUser)
        console.log("foundUser", foundUser)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

module.exports = userController