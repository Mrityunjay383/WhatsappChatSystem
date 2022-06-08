const express = require("express");
const router = express.Router();

const {valToken, isAdmin, isAdminOrManager} = require("../middleware/auth");
const controller = require('../controller/dashboard');//Requring Controllers

//Dashboard route
router.get("/", valToken, controller.home);

//Getting all agents route
router.get("/agents", valToken, isAdminOrManager, controller.agents);

//Getting specific user route
router.get("/indi_user", valToken, isAdmin, controller.indiUser);

//Deleteing user for database
router.delete("/del_agent", valToken, isAdminOrManager, controller.delAgent);

router.delete("/del_manager", valToken, isAdmin, controller.delManager);

//Getting all managers route
router.get("/managers", valToken, isAdmin, controller.managers);

module.exports = router
