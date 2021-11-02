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
// -- User creates an order pertaining all listed information: -- 
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

        const orderInfo = await Order.create(req.body)
        console.log('orderInfo:',orderInfo)
        const newOrder = await Order.findOneAndUpdate(
            {_id:orderInfo._id},
            {
                $push: {
                    "items":getCart,
                    "chefs":chefs
                }
            },
            {new:true}
        )
        console.log('newOrder:',newOrder)

        // -- Calculate Grand Total --
        const itemsTotalArr = newOrder.items.map(item => item.total)
        console.log('itemsTotalArr:', itemsTotalArr)
        const sum = itemsTotalArr.reduce((acc, val) => acc + val, 0)
        console.log('sum:', sum)

        const grandTotal = await Order.findByIdAndUpdate(
            newOrder._id,
            {
                $set: {
                    "grandTotal":sum
                }
            },
            {new:true} 
        )
        console.log("grandTotal:",grandTotal)

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

// -- User adds item to their cart (matching itemID, sum Qty, calculate total) --
userController.put("/cart", async (req, res) => {
    try{
        const id = req.params.Uid 
        const itemId = req.body._id
        console.log("itemId:",itemId)
        const foundItem = await Item.findById(itemId)
        console.log("found Item",foundItem)
        const total = foundItem.price * req.body.qty

        const getUser = await User.findOne({_id:id})
        console.log("getUser:",getUser)


        const checkCart = getUser.cart.filter(
            item => item.item.title === foundItem.title
        );
        console.log('checkCart:', checkCart)

        if(checkCart[0]){
            const oldQty = checkCart[0].qty
            console.log("oldQty:",oldQty)
            const oldTotal = checkCart[0].total
            console.log("oldTotal:",oldTotal)
            const newQty = oldQty + parseInt(req.body.qty)
            const newTotal = newQty * foundItem.price
            console.log("newQty:",newQty)
            console.log("newTotal:",newTotal)
            const newQty_Total = await User.findOneAndUpdate(
                {
                    _id:id,
                    "cart._id":foundItem._id,
                },
                {
                    $set:{
                        "cart.$.qty":newQty,
                        "cart.$.total":newTotal
                    }
                },
                {new:true}
            )
            console.log("newQty_Total",newQty_Total)
            res.status(200).json(newQty_Total)
        } else {
            const foundUser = await User.findOneAndUpdate(
                {_id:id}, 
                {
                    $push: { 
                        "cart": {
                            "_id": foundItem._id,
                            "chef": foundItem.chef, 
                            "item": foundItem, 
                            "qty": req.body.qty,
                            "total": total
                        }
                    }
                },
                {new: true}
            ).populate("cart").exec();
            console.log("found User:",foundUser)
            res.status(200).json(foundUser)
        }
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
});


// -- User removes item from their cart (Removes entire item by id) -- 
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
                        // "qty": req.body.qty
                    }
                }
            }, 
            {new:true}
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
// -- User deleted -- 
userController.delete("/", async (req, res) => {
    try{
        const id = req.params.Uid
        const deletedUser = await User.findOneAndRemove({_id:id})
        console.log("deletedUser:",deletedUser)
        const deletedChef = await Chef.findOneAndRemove({user:id})
        console.log("deletedChef:",deletedChef)
        
        // -- Delete items associated with chef.id  --
        const deletedItem = await Item.deleteMany(
            {"chef":deletedChef._id}
        )
        console.log('deletedItem:', deletedItem)
         
        // -- Remove items from Users's cart associated with chef.id -- 
        const removeCartItem = await User.updateMany(
            {"cart.chef":deletedChef._id},
            {
                "cart": {
                    $pullAll: {
                        "chef":deletedChef._id
                    }
                }
            },
            {
                new:true,
                multi:true
            }
        )
        console.log('removeCartItem:', removeCartItem)

        // -- Removes the empty object --
        const removeEmptyObj = await User.updateMany(
            {"cart.qty":0},
            {
                "cart" : {
                    $pullAll:{
                        "qty":0
                    }
                }
            },
            {
                new:true,
                multi:true
            }
        )
        console.log('removeEmptyObj:', removeEmptyObj)

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