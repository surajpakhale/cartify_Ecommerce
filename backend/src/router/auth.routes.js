const express = require("express")
const authController= require("../controller/user.controller")
const authMiddleware = require("../middleware/auth.middleware")

const router = express.Router()

router.post("/register",authController.registerUser)
router.post("/login",authController.loginUser)
router.get("/users",authMiddleware.authUser, authController.getUser)
router.get("/logout",authController.logoutUser)
module.exports = router;