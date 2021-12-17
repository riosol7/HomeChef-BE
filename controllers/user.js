require("dotenv").config()
const mongoose = require("mongoose")
const express = require("express");
const User = require("../models/User")
const Chef = require("../models/Chef")
const Item = require("../models/Item")
const Order = require("../models/Order")
const userController = require("express").Router({ mergeParams: true });
const { createUserToken, requireToken } = require("../middleware/auth");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
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

        const orderInfo = await Order.create({
            user: {
                userId: getUser._id,
                fullName: req.body.fullName,
                address:{
                    street: req.body.street,
                    apt: req.body.apt,
                    city: req.body.city,
                    zip: req.body.zip,
                    state: req.body.state
                },
                phone: req.body.phone,
                email:req.body.email,
                deliveryInstructions: req.body.deliveryInstructions
            },
            tip: req.body.tip
        })
        console.log('orderInfo:',orderInfo)
        const newOrder = await Order.findOneAndUpdate(
            {_id:orderInfo._id},
            {
                $push: {
                    "items":getCart,
                    "chefs":chefs,
                }
            },
            {new:true}
        )
        console.log('newOrder:',newOrder)

        // -- Calculate Sub/Grand Total --
        const roundToHundredth = (value) => {
            return Number(value.toFixed(2));
        }
        const itemsTotalArr = newOrder.items.map(item => item.total)
        console.log('itemsTotalArr:', itemsTotalArr)
        const sum = itemsTotalArr.reduce((acc, val) => acc + val, 0)
        console.log('sum:', sum)
        const deliveryFee = 1.99
        const tax = sum * .095//CA TAX
        const roundTaxes = roundToHundredth(tax)
        const roundSum = roundToHundredth(sum)
        const grandTotal = roundSum + Number(req.body.tip) + deliveryFee + roundTaxes
        let roundGrandTotal = roundToHundredth(grandTotal)
        console.log("roundGrandTotal:",roundGrandTotal)

        const subTotal = await Order.findByIdAndUpdate(
            newOrder._id,
            {
                $set: {
                    "subTotal":roundSum,
                    "grandTotal":roundGrandTotal,
                }
            },
            {new:true} 
        )
        console.log("subTotal:",subTotal)
        res.status(200).json(newOrder)
        } catch (err) {
            res.status(400).json({ error: err.message })
        }
})

userController.post("/payment", async (req, res) => {
    try {
        const { amount } = req.body;
        console.log("amount:", amount)
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: "usd"
        });
        console.log("paymentIntent:",paymentIntent)
        res.status(200).send(paymentIntent.client_secret);
    } catch (err) {
        res.status(500).json({ statusCode: 500, message: err.message })
    }
    })

// =============================
//         UPDATE
// =============================
// -- User edits --
userController.put("/", async (req, res) => {
    try{
        if(req.body.street){
            const savedAddress = await User.findByIdAndUpdate(
                req.params.Uid,
                {
                    $push :{
                        "savedAddress":{
                            "street": req.body.street,
                            "apt": req.body.apt,
                            "city": req.body.city,
                            "zip": req.body.zip,
                            "state": req.body.state,
                        }
                    }
                },
                {new:true}
            )
            console.log("savedAddress:", savedAddress)
            res.status(200).json(savedAddress)
        } else {
            const updatedUser = await User.findByIdAndUpdate(
                req.params.Uid,
                req.body,
                {new:true}
            )
            console.log("updatedUser:",updatedUser)
            res.status(200).json(updatedUser)
        }
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

// -- Remove Address --
userController.put("/removeAddress/:id", async (req, res) => {
    try{
        const addressId = mongoose.Types.ObjectId(req.params.id)
        const removeAddress = await User.findByIdAndUpdate(
            req.params.Uid,
            {   
                $pull:{
                    "savedAddress":{
                        "_id":addressId
                    }
                }
            },
            {new:true}
        )
        console.log("removeAddress:", removeAddress)
        res.status(200).json(removeAddress)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

// -- User adds item to their cart (matching itemID, sum Qty, calculate total) --
userController.put("/cart", async (req, res) => {
    try{
        const roundToHundredth = (value) => {
            return Number(value.toFixed(2));
        }
        const id = req.params.Uid 

        const selectedOptions = req.body.options
        console.log("selectedOptions:",selectedOptions)

        const itemId = req.body._id
        console.log("itemId:",itemId)

        const foundItem = await Item.findById(itemId)
        console.log("found Item",foundItem)

        const total = foundItem.price * req.body.qty
        const roundTotal = roundToHundredth(total)
        console.log("roundTotal",roundTotal)

        const getUser = await User.findOne({_id:id})
        console.log("getUser:",getUser)

        const checkCart = getUser.cart.filter(
            item => item.item.title === foundItem.title
        );
        console.log('checkCart:', checkCart)

        if(checkCart[0] && selectedOptions === undefined){
            const roundToHundredth = (value) => {
                return Number(value.toFixed(2));
            }
            const oldQty = checkCart[0].qty
            console.log("oldQty:",oldQty)

            const oldTotal = checkCart[0].total
            console.log("oldTotal:",oldTotal)

            const newQty = oldQty + parseInt(req.body.qty)
            console.log("newQty:",newQty)

            const newTotal = newQty * foundItem.price
            console.log("newTotal:",newTotal)
        
            const roundNewTotal = roundToHundredth(newTotal)
            console.log("roundNewTotal:", roundNewTotal)

            //Adding items that are already in the cart, just recalculating total and qty
            const newQty_Total = await User.findOneAndUpdate(
                {
                    _id:id,
                    "cart._id":foundItem._id,
                },
                {
                    $set:{
                        "cart.$.qty":newQty,
                        "cart.$.total":roundNewTotal
                    }
                },
                {new:true}
            )
            console.log("newQty_Total",newQty_Total)
            res.status(200).json(newQty_Total)

            //If option available and item already in  cart will override existing data
        }   else if (selectedOptions && checkCart[0]) {
            const roundToHundredth = (value) => {
                return Number(value.toFixed(2));
            }
            const oldQty = checkCart[0].qty
            console.log("oldQty:",oldQty)

            const oldTotal = checkCart[0].total
            console.log("oldTotal:",oldTotal)

            const newQty = oldQty + parseInt(req.body.qty)
            console.log("newQty:",newQty)

            const totalArr = selectedOptions.map(option => option.price)
            console.log("totalArr:", totalArr)

            const optionTotalB = totalArr.reduce((a, b) => Number(a) + Number(b), 0)
            console.log("optionTotalB:",optionTotalB)

            const optionTotal = Number(optionTotalB)
            const roundOptionTotal = roundToHundredth(optionTotal)
            console.log("roundOptionTotal:", roundOptionTotal)

            const newOptionTotal = newQty * roundOptionTotal 
            const totalNoOptions = newQty * foundItem.price
            const newTotal = newOptionTotal + totalNoOptions 
            const roundNewTotal = roundToHundredth(newTotal)
            console.log("roundNewTotal:", roundNewTotal)

            const overrideItemToCart = await User.findOneAndUpdate(
                {
                    _id:id,
                    "cart._id":foundItem._id,
                },
                {
                    $set:{
                        "cart.$.qty":newQty,
                        "cart.$.options":selectedOptions,
                        "cart.$.total":roundNewTotal
                    }
                },
                {new:true}
            )
            console.log("overrideItemToCart ",overrideItemToCart )
            res.status(200).json(overrideItemToCart)

        } else if (selectedOptions && !checkCart[0]) {
            const roundToHundredth = (value) => {
                return Number(value.toFixed(2));
            }
            const totalArr = selectedOptions.map(option => option.price)
            console.log("totalArr:", totalArr)

            const optionTotalB = totalArr.reduce((a, b) => Number(a) + Number(b), 0)
            console.log("optionTotalB:",optionTotalB)

            const optionTotal = Number(optionTotalB)
            const roundOptionTotal = roundToHundredth(optionTotal)
            console.log("roundOptionTotal:", roundOptionTotal)

            const newOptionTotal = req.body.qty * roundOptionTotal 
            const totalNoOptions = req.body.qty * foundItem.price
            const newTotal = newOptionTotal + totalNoOptions 
            const roundNewTotal = roundToHundredth(newTotal)
            console.log("roundNewTotal:", roundNewTotal)

            const addNewItemToCart = await User.findOneAndUpdate(
                {_id:id},
                {
                    $push: { 
                        "cart": {
                            "_id": foundItem._id,
                            "chef": foundItem.chef, 
                            "item": foundItem,
                            "options": selectedOptions, 
                            "qty": req.body.qty,
                            "total": roundNewTotal
                        }
                    }
                },
                {new: true}
            ).populate("cart").exec();
            console.log("addNewItemToCart",addNewItemToCart)
            res.status(200).json(addNewItemToCart)
        
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
                            "total": roundTotal
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


// User updates cart (new: Qty, Total)/ Removes item from cart
userController.put('/cart/:id', async (req, res) => {
    try {
        console.log("User:", req.params.Uid)
        console.log("Body:", req.body)
        const id = req.params.Uid
        const itemId = req.body._id || req.params.id
        console.log("itemId:", itemId)
        const foundItem = await Item.findById(itemId)
        console.log("foundItem:", foundItem)
        const roundToHundredth = (value) => {
            return Number(value.toFixed(2));
        }

        const getUser = await User.findOne({_id:id})
        console.log("getUser:",getUser)


        const checkCart = getUser.cart.filter(
            item => item.item.title === foundItem.title
        );
        console.log("checkCart:",checkCart)
        const oldQty = checkCart[0].qty
        console.log("oldQty:",oldQty)
        const oldTotal = checkCart[0].total
        console.log("oldTotal:",oldTotal)

        // -- User removes item from their cart (Removes entire item by id) -- 
        if(req.body.qty === "Remove"){
            const foundUser = await User.findOneAndUpdate(
                {_id:id}, 
                {
                    $pull: { 
                        "cart": {
                            "_id": foundItem._id,
                        }
                    }
                }, 
                {new:true}
            )
            res.status(200).json(foundUser)
            console.log("foundUser:", foundUser)

        }  else if(checkCart[0].options) {
            const newQty = req.body.qty
            
            const totalArr = checkCart[0].options.map(option => option.price)
            console.log("totalArr:", totalArr)

            const optionTotalB = totalArr.reduce((a, b) => Number(a) + Number(b), 0)
            console.log("optionTotalB:",optionTotalB)

            const optionTotal = Number(optionTotalB)
            const roundOptionTotal = roundToHundredth(optionTotal)
            console.log("roundOptionTotal:", roundOptionTotal)

            const newOptionTotal = newQty * roundOptionTotal 
            const totalNoOptions = newQty * foundItem.price
            const newTotal = newOptionTotal + totalNoOptions 
            const roundNewTotal = roundToHundredth(newTotal)
            console.log("roundNewTotal:", roundNewTotal)

            const updateCart= await User.findOneAndUpdate(
                {
                    _id:id,
                    "cart._id":foundItem._id,
                },
                {
                    $set: { 
                        "cart.$.qty":newQty,
                        "cart.$.total":roundNewTotal
                    }
                }, 
                {new:true}
            )
            res.status(200).json(updateCart)
            console.log("updateCart:(withOption)", updateCart)

        } else {
            // -- User updates qty, changing total --
            const newQty = req.body.qty
            const newTotal = newQty * foundItem.price
            console.log("newQty:",newQty)
            console.log("newTotal:",newTotal)
            const updateCart = await User.findOneAndUpdate(
                {
                    _id:id,
                    "cart._id":foundItem._id,
                },
                {
                    $set: { 
                        "cart.$.qty":newQty,
                        "cart.$.total":roundToHundredth(newTotal)
                    }
                }, 
                {new:true}
            )
            res.status(200).json(updateCart)
            console.log("updateCart:", updateCart)
        }
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

//-- Only remove Item from cart --
userController.put("/cart/remove/:id", async (req, res) => {
    try{
        const id = req.params.Uid
        const itemId = req.body._id || req.params.id
        console.log("itemId:", itemId)
        const foundItem = await Item.findById(itemId)

        const removeItemFromCart = await User.findOneAndUpdate(
            {_id:id},
            {
                $pull: { 
                    "cart": {
                        "_id": foundItem._id,
                    }
                }
            }, 
            {new:true}
        )
        res.status(200).json(removeItemFromCart)
        console.log("removeItemFromCart:", removeItemFromCart)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

userController.put("/isPaid", async (req, res) => {
    try {
        const orderId = mongoose.Types.ObjectId(req.body._id)
        console.log("req.body:",req.body)
        console.log("orderId:",orderId)

        const orderIsPaid = await Order.findOneAndUpdate(
            {_id:orderId},
            {
                $set: {
                    "isPaid": true
                }
            },
            {new:true}
        )
        console.log("orderIsPaid:",orderIsPaid)

        const orderHistory = await User.findOneAndUpdate(
            {_id:req.params.Uid},
            {
                $push: {
                    "orderHistory": orderIsPaid 
                },
            },
            {new:true},
        )
        console.log("orderHistory:", orderHistory)

        res.status(200).json(orderIsPaid)

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