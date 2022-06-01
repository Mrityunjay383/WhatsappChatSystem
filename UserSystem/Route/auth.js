const express = require("express");
const router = express.Router();

const controller = require('../controller/auth');//Requring Controllers

const {valToken, isAdmin} = require("../middleware/auth");

router.post("/register", valToken, isAdmin, controller.register);

router.post("/login", controller.login);

module.exports = router
