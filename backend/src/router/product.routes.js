// const express = require("express");
// const authMiddleware = require("../middleware/auth.middleware")
// const authProduct = require("../controller/product.controller")
// const router = express.Router();
// const multer = require("multer");
// const upload =multer({dest : 'uploads/'});

// router.get("/",authProduct.getProduct)
// router.post("/", authMiddleware.authAdmin, upload.single('image'), authProduct.createProduct)
// router.get("/:id",authProduct.getProductById)   
// router.put("/:id", authMiddleware.authAdmin, upload.single('image'), authProduct.updateProduct)
// router.delete("/:id",authMiddleware.authAdmin,authProduct.deleteProduct)



// module.exports = router;



const express = require("express");
const authMiddleware = require("../middleware/auth.middleware")
const authProduct = require("../controller/product.controller")
const router = express.Router();
const multer = require("multer");

// Purana: const upload = multer({dest : 'uploads/'}); ❌
// Naya Vercel ke liye: ✅
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/",authProduct.getProduct)
router.post("/", authMiddleware.authAdmin, upload.single('image'), authProduct.createProduct)
router.get("/:id",authProduct.getProductById)   
router.put("/:id", authMiddleware.authAdmin, upload.single('image'), authProduct.updateProduct)
router.delete("/:id",authMiddleware.authAdmin,authProduct.deleteProduct)

module.exports = router;