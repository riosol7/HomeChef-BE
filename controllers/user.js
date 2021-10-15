const express = require("express");
const User = require("../models/User")
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
        console.log("getUserCart", getUser.cart)
        res.status(200).json(getCart)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})


//CREATE - User adds item to their cart

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


userController.put("/", async (req, res) => {
    try{
        console.log('testing')
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
        res.status(200).json()
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
});

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

module.exports = userController