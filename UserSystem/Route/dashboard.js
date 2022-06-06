const express = require("express");
const router = express.Router();

const {valToken, isAdmin, isAdminOrManager} = require("../middleware/auth");
const controller = require('../controller/dashboard');//Requring Controllers


router.get("/", valToken, controller.home);

router.get("/agents", valToken, isAdminOrManager, controller.agents);

router.delete("/del_user", valToken, isAdmin, controller.delUser);

router.get("/managers", valToken, isAdmin, controller.managers);

module.exports = router
