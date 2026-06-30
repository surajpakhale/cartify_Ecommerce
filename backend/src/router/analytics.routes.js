const express = require("express")
const authMiddleware = require("../middleware/auth.middleware");
const analyticsController= require("../controller/analytics.controller")

const router = express.Router();

router.get("/",authMiddleware.authUser,authMiddleware.authAdmin,analyticsController.getAdminStat)

module.exports = router;