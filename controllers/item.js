const express = require("express");
const Chef = require("../models/Chef");
const User = require("../models/User");
const Item = require("../models/Item");
const itemController = require("express").Router({ mergeParams: true });
const { createUserToken, requireToken } = require("../middleware/auth")

// =============================
//         READ
// =============================
// -- Find all items --
itemController.get("/", async (req, res) => {
    try{
        const getItem = await Item.find()
        res.status(200).json(getItem)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

// -- Find item --
itemController.get("/:id", async (req, res) => {
    try{
        const foundItem = await Item.findById(req.params.id)
        console.log(foundItem)
        res.status(200).json(foundItem)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

// =============================
//         CREATE
// =============================
// -- Chef creates an item / adds item into their array --
itemController.post("/", async (req, res) => {
    try{
        const id = req.params.Uid || req.body.chef
        console.log('req.body:', req.body)
        const newItem = await Item.create(req.body)
        console.log("newItem:",newItem)
        const foundChef = await Chef.findOneAndUpdate(
            {user:id}, 
            { 
                "$push": { 
                    "items": newItem 
                } 
            },
            { "new": true }
        ).populate('items').exec();
        console.log("foundChef:",foundChef)
        res.status(200).json(newItem)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}); 

// =============================
//         UPDATE
// =============================
// -- Chef updates item, includes itemsArr, CartArr --
itemController.put("/:id", async (req, res) => {
    try{
        const id = req.params.Uid
        console.log('id:',id) 
        const updatedItem = await Item.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            {new:true}
        )
        console.log('updatedItem:',updatedItem._id)

        // -- Find & update item from an array of objects --
        const itemsArr = await Chef.findOneAndUpdate(
            {
                user:id,
                "items._id":updatedItem._id
            },
            {
                $set: {
                    "items.$.chef":updatedItem.chef,
                    "items.$.title":updatedItem.title,
                    "items.$.description":updatedItem.description,
                    "items.$.timeDuration":updatedItem.timeDuration,
                    "items.$.price":updatedItem.price,
                    "items.$.options":updatedItem.options,
                    "items.$.image":updatedItem.image,
                    "items.$.tags":updatedItem.tags
                }
            },
            {new:true}
        )
        console.log('itemArr:',itemsArr)
        
        // -- Updates users's carts who contain the item --
        const cartArr = await User.updateMany(
            {
                "cart.item._id":updatedItem._id
            },
            {
                $set: {
                    "cart.$.item.chef":updatedItem.chef,
                    "cart.$.item.title":updatedItem.title,
                    "cart.$.item.description":updatedItem.description,
                    "cart.$.item.timeDuration":updatedItem.timeDuration,
                    "cart.$.item.price":updatedItem.price,
                    "cart.$.item.image":updatedItem.image,
                    "cart.$.item.tags":updatedItem.tags,
                    "cart.$.item.options":updatedItem.options,
                }
            },
            {
                new:true,
                multi:true,
            }
        )
        console.log('cartArr:', cartArr)
        res.status(200).json(updatedItem)
    } catch (err) {
        res.status(400).json({ error: error.message })
    }
})

itemController.put("/like/:id", async (req, res) => {
    const foundItem = await Item.findById(req.params.id)
    const foundUser = await User.findById(req.params.Uid)
    const chefItemLiked = await Chef.findOneAndUpdate(
        {
            _id:foundItem.chef,
            "items._id":foundItem._id
        },
        {
            $set: {
                "items.$.likeTotal": Number(foundItem.likeTotal) + 1,
            },
            $push: {
                "items.$.likes": foundUser.user
            },
        },
        {new:true}
    )
    console.log('chefItemLiked:', chefItemLiked)

    const likeItem = await Item.findByIdAndUpdate(
        req.params.id,
        {
            $set:{
                "likeTotal": Number(foundItem.likeTotal) + 1,
            },
            $push:{
                "likes": foundUser.user
            }
        },
        {new:true}
    )
    console.log('likeItem:', likeItem)
    res.status(200).json(likeItem)
})

itemController.put("/unlike/:id", async (req, res) => {
    const foundItem = await Item.findById(req.params.id)
    const foundUser = await User.findById(req.params.Uid)
    const chefItemUnliked = await Chef.findOneAndUpdate(
        {
            _id:foundItem.chef,
            "items._id":foundItem._id
        },
        {
            $set: {
                "items.$.likeTotal": Number(foundItem.likeTotal) - 1,
            },
            $pull: {
                "items.$.likes": foundUser.user
            },
        },
        {new:true}
    )
    console.log('chefItemUnliked:', chefItemUnliked)
    const unlikeItem = await Item.findByIdAndUpdate(
        req.params.id,
        {
            $set:{
                "likeTotal": Number(foundItem.likeTotal) - 1,
            },
            $pull:{
                "likes": foundUser.user
            }
        },
        {new:true}
    )
    console.log('likeItem:', unlikeItem)
    res.status(200).json(unlikeItem)
})

// =============================
//         DELETE
// =============================
// -- Chef deletes item from the db, arrays --
itemController.delete("/:id", async (req, res) => {
    try {
        const id = req.params.Uid 
        const foundItem = await Item.findById(req.params.id)
        console.log('foundItem:',foundItem)
        let itemId = foundItem._id
        console.log('itemId:', itemId)
        const deletedItem = await Item.findByIdAndRemove(req.params.id)
        const removeItemArr = await Chef.findOneAndUpdate(
            {user:id},
            {
                $pull:{
                    'items':foundItem
                }
            }, 
            {new:true}
        )
        console.log('removeItemArr:', removeItemArr)

        // -- Remove item from users's cart --
        const removeCartItem = await User.updateMany(
            {"cart.item._id":itemId},
            {
                $pull:{
                    "cart":{
                        "_id":itemId,
                    }
                }
            },
            {
                new:true,
                multi:true
            }
        )
        console.log('removeCartItem:', removeCartItem)
        res.status(200).json(deletedItem)
    } catch (err) {
        res.status(400).json({ error: error.message })
    }
})

module.exports = itemController
