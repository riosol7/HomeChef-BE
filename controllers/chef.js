const mongoose = require("mongoose")
const User = require("../models/User");
const Chef = require("../models/Chef");
const Item = require("../models/Item");
const Order = require("../models/Order");
const chefController = require("express").Router({ mergeParams: true });
const { createUserToken, requireToken } = require("../middleware/auth");

// =============================
//         READ
// =============================
// -- Find Chef --
chefController.get("/", async (req, res) => {
    try{
        const id = req.params.Uid
        const chef = await Chef.findOne({user:id})
        console.log("chef:",chef)
        res.status(200).json(chef)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

// // -- Find all Chefs --
chefController.get("/all", async (req, res) => {
    try{
        const chefs = await Chef.find()
        res.status(200).json(chefs)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

// -- Get orders pertaining to chef --
chefController.get("/order", async (req, res) => {
    try{
        const id = req.params.Uid
        console.log('id:',id)
        const foundChef = await Chef.findOne({user:id})
        console.log('foundChef:', foundChef)
        const chefId = foundChef._id 
        console.log('chefId:', chefId)
        const getOrders = await Order.find(
            {"items.item.chef":chefId}
        )
        console.log('getOrders:', getOrders)
        res.status(200).json(getOrders)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

// -- Find chef By item --
chefController.get("/item/:id", async (req, res) => {
    try{
        const itemId = mongoose.Types.ObjectId(req.params.id)
        console.log("itemId:", itemId)
            const foundChef = await Chef.findOne({
                "items._id": itemId 
            })
            res.status(200).json(foundChef)
            console.log('foundChef',foundChef)
        
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

// -- Find chef By ID --
chefController.get("/:id", async (req, res) => {
    try{
        cId = req.params.id
        console.log("cId:", cId)
        const foundChef = await Chef.findById(req.params.id)
        res.status(200).json(foundChef)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

// =============================
//         CREATE
// =============================
// -- New chef --
chefController.post("/", async (req, res) => {
    try{
        const newChef = await Chef.create(req.body)
        res.status(200).json(newChef)
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// =============================
//         UPDATE
// =============================
// -- Edit chef --
chefController.put("/:id", async (req, res) => {
    try{
        console.log('Body:',req.body)
        if(req.body.street){
            const updatedChef = await Chef.findByIdAndUpdate(
                req.params.id, 
                {
                    "name": req.body.name,
                    "bio": req.body.bio,
                    "image": req.body.image,
                    "phone": req.body.phone,
                    "availability": req.body.availability, 
                    "address": {
                        "street": req.body.street,
                        "city": req.body.city,
                        "state": req.body.state,
                        "zip": req.body.zip
                    }
                }, 
                {new:true}
            )
            console.log('updatedChef:',updatedChef) 
            res.status(200).json(updatedChef)
        } else {
            const updatedChef = await Chef.findByIdAndUpdate(
                req.params.id, 
                req.body, 
                {new:true}
            )
            console.log('updatedChef:',updatedChef) 
            res.status(200).json(updatedChef)
        }
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

// -- Order status -- 
// Chef options: Accepted, Declined, Cooking, Ready For Delivery/Pickup
// User options: Received
// Driver options: Delivery, Delivered
chefController.put("/order/:id", async (req, res) => {
    try{
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new:true}
        )
        console.log('updatedOrder:', updatedOrder)
        res.status(200).json(updatedOrder)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

// =============================
//         DELETE
// =============================
// -- Destroy chef -- WIP   
//ISSUE: upon deletion cart item remains an empty with qty at 0?
chefController.delete("/:id", async (req, res) => {
    try{
        const id = req.params.Uid
        const deletedChef = await Chef.findOneAndRemove({user:id})
        console.log('deletedChef:', deletedChef)

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

        // -- Removes the empty object?? --
        const removeEmptyObj = await User.updateMany(
            {"cart.qty":0},
            {
                "cart":{
                    $pull:{
                        "qty":0
                    }
                }
            },
            {
                new:true
            }
        )
        console.log('removeEmptyObj:', removeEmptyObj)

        res.status(200).json(deletedChef)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

module.exports = chefController