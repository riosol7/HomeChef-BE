const express = require("express");
const Chef = require("../models/Chef");
const User = require("../models/User");
const Item = require("../models/Item");
const itemController = require("express").Router({ mergeParams: true });
const { createUserToken, requireToken } = require("../middleware/auth")

//READ - Find all items
itemController.get("/", async (req, res) => {
    try{
        const getItem = await Item.find()
        res.status(200).json(getItem)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

//CREATE - Chef creates an item / adds item into their array.
itemController.post("/", async (req, res) => {
    try{
        const id = req.params.Uid || req.body.chef
        const newItem = await Item.create(req.body)
        console.log("newItem:",newItem)
        const foundChef = await Chef.findOneAndUpdate({user:id}, { 
            "$push": { "items": newItem } 
        },{ "new": true }).populate('items').exec();
        console.log("foundChef:",foundChef)
        res.status(200).json(foundChef)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}); 

//UPDATE - Chef updates item, includes itemsArr, CartArr
itemController.put('/:id', async (req, res) => {
    try{
        const id = req.params.Uid
        console.log('id:',id) 
        const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, {new:true})
        console.log('updatedItem:',updatedItem._id)

        // Find & update item from an array of objects
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
                    "items.$.price":updatedItem.price,
                    "items.$.image":updatedItem.image,
                    "items.$.tags":updatedItem.tags
                }
            },
            {
                new:true
            }
        )
           
        console.log('itemArr:',itemsArr)
        
        const cartArr = await User.findOneAndUpdate(
            {
                "cart.item._id":updatedItem._id
            },
            {
                $set: {
                    "cart.$.item.chef":updatedItem.chef,
                    "cart.$.item.title":updatedItem.title,
                    "cart.$.item.description":updatedItem.description,
                    "cart.$.item.price":updatedItem.price,
                    "cart.$.item.image":updatedItem.image,
                    "cart.$.item.tags":updatedItem.tags
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

//DESTROY - Chef deletes item from the db, arrays
itemController.delete('/:id', async (req, res) => {
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

        //NEED TO WORK ON ASAP - removes item as null, qty remains.
        const removeCartItem = await User.findOneAndUpdate(
            {"cart.item._id":itemId},
            {
                $pull:{
                    "cart":{
                        "item":foundItem,
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
