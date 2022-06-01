const express = require("express");
const router = express.Router();

const {valToken, isAdmin} = require("../middleware/auth");
const controller = require('../controller/dashboard');//Requring Controllers


router.get("/", valToken, controller.home);

router.get("/agents", valToken, isAdmin, controller.agents);

router.delete("/agent", valToken, isAdmin, controller.delAgent);

module.exports = router
