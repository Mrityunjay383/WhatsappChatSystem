const express = require("express");
const router = express.Router();

const controller = require('../controller/auth');//Requring Controllers

const {valToken, isAdmin, isAdminOrManager} = require("../middleware/auth");

router.post("/register", valToken, isAdminOrManager, controller.register);

router.post("/login", controller.login);

router.get("/logout", controller.logout);

module.exports = router
