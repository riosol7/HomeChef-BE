const express = require("express");
const Chef = require("../models/Chef");
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

//OLD
// itemController.post("/", async (req, res) => {
//     try{
//         const id = (req.user && req.user.id) || req.body.chef
//         const newItem = await Item.create(req.body)
//         const foundChefItems = await Chef.findById(id).populate("items").exec();
//         console.log(foundChefItems)
//         foundChefItems.items.push(newItem)
//         await foundChefItems.save()
//         res.status(200).json(foundChefItems)
//     } catch (err) {
//         res.status(400).json({ error: err.message })
//     }
// }); 

//CREATE - Chef creates an item
itemController.post("/", async (req, res) => {
    try{
        const id = req.params.Uid || req.body.chef
        const newItem = await Item.create(req.body)
        const foundChef = await Chef.findOneAndUpdate({user:id}, { 
            "$push": { "items": newItem } 
        },{ "new": true }).populate('items').exec();
        console.log(foundChef)
        res.status(200).json(foundChef)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}); 

//UPDATE 
itemController.put('/:id', async (req, res) => {
    try{  
        const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, {new:true})
        res.status(200).json(updatedItem)
    } catch (err) {
        res.status(400).json({ error: error.message })
    }
})

//DESTROY - Chef destroys item
itemController.delete('/:id', async (req, res) => {
    try {
        const deletedItem = await Item.findByIdAndRemove(req.params.id)
        res.status(200).json(deletedItem)
    } catch (err) {
        res.status(400).json({ error: error.message })
    }
})

module.exports = itemController
