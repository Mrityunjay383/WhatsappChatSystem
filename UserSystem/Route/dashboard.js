const express = require("express");
const router = express.Router();

const {valToken, isAdmin, isAdminOrManager} = require("../middleware/auth");
const controller = require('../controller/dashboard');//Requring Controllers

//Dashboard route
router.get("/", valToken, controller.home);

//Getting all agents route
router.get("/agents", valToken, isAdminOrManager, controller.agents);

//Getting specific user route
router.get("/indi_user", valToken, controller.indiUser);

//Deleteing user for database
router.post("/del_agent", valToken, isAdminOrManager, controller.delAgent);

router.post("/del_manager", valToken, isAdmin, controller.delManager);

//Getting all managers route
router.get("/managers", valToken, isAdmin, controller.managers);

router.post("/change_name", valToken, controller.changeName);

router.post("/change_password", valToken, controller.changePassword);

module.exports = router
