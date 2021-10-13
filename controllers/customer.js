const mongoose = require("mongoose");
const User = require("../models/User");
const Customer = require("../models/Customer");
const customerController = require("express").Router({ mergeParams: true });
const { createUserToken, requireToken } = require("../middleware/auth");

module.exports = customerController