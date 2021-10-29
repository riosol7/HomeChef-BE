const User = require("../models/User");
const Chef = require("../models/Chef");
const Order = require("../models/Order");
const chefController = require("express").Router({ mergeParams: true });
const { createUserToken, requireToken } = require("../middleware/auth");

// =============================
//         READ
// =============================
// -- Find all Chefs --
chefController.get("/", async (req, res) => {
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

// -- Find chef --
chefController.get("/:id", async (req, res) => {
    try{
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
        const updatedChef = await Chef.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            {new:true}
        )
        console.log('updatedChef:',updatedChef) 
        res.status(200).json(updatedChef)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

// =============================
//         DELETE
// =============================
//DELETE - destroy chef  
//UPDATE WIP: once chef is deleted, items that pertain to the chef must also be pulled...
// list: from user.cart.item, item model
chefController.delete("/:id", async (req, res) => {
    try{
        const deletedChef = await Chef.findByIdAndRemove(req.params.id)
        console.log('deletedChef:', deletedChef)
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

        //NEED TO WORK ON ASAP - removes item as null, qty remains. (TEST!! NOW)
        //ALSO needs to delete item from all users that contain it.
        // Need to pull items that match the chef.ids, then remove all by matching the item or using id to get rid of all?
        const removeCartItem = await User.updateMany(
            {"cart.item.chef":req.params.id},
            {
                $pull:{
                    "cart.item.chef":deletedChef._id
                }
            },
            {
                new:true,
                multi:true
            }
        )
        console.log('removeCartItem:', removeCartItem)
        res.status(200).json(deletedChef)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

module.exports = chefController