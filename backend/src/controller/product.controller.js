const productModel = require("../models/product.model")
const cloudinary = require("../config/cloudinary")
const streamifier = require('streamifier'); // Ye install karna padega

async function getProduct(req,res){
    try{
        const products = await productModel.find();
        res.status(200).json({
            message:"Products fetch sucessfully..",
            products
        })
    }catch(error){
        console.log("message is :",error)
        res.status(500).json({ message: "Server error", error })
    }
}

async function getProductById(req,res){
    try{
        const product = await productModel.findById(req.params.id);
        if(product){
            res.status(200).json(product)
        }else{
            res.status(404).json({
                message :"Product not found...."
            })
        }
    }catch(error){
        console.log("Message project Id is ", error)
        res.status(500).json({ message: "Server error", error })
    }
}

// Cloudinary upload helper for buffer
const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "products" },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
};

async function createProduct(req,res){
    try{
        const {name , description , price , category , stock} = req.body;
        let imageUrl = "";
        
        // Purana: req.file.path ❌
        // Naya: req.file.buffer ✅
        if(req.file){
            const result = await uploadToCloudinary(req.file.buffer);
            imageUrl = result.secure_url;
        }
        
        const product = new productModel({
            name,
            description,
            price,
            category,
            stock,
            imageUrl
        })
        const savedProduct = await product.save();
        res.status(201).json(savedProduct);
    }catch(error){
        console.log(error);
        res.status(500).json({
            message:"Server error", error: error.message
        })
    }
}

async function updateProduct(req, res) {
    try {
        const { name, description, price, category, stock } = req.body;
        const product = await productModel.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price || product.price;
        product.category = category || product.category;
        product.stock = stock || product.stock;

        // Purana: req.file.path ❌
        // Naya: req.file.buffer ✅
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);
            product.imageUrl = result.secure_url; 
        }
        
        const updatedProduct = await product.save();
        res.status(200).json(updatedProduct); 

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Server error", error: error.message
        });
    }
} 

async function deleteProduct (req, res){
    try{
        const product = await productModel.findById(req.params.id);
        if(product){
            await product.deleteOne();
            res.status(200).json({
                message:"Product is deleted...."
            })
        }else{
            res.status(404).json({
                message:"Product not found"
            })
        }
    }catch(error){
        console.log('Message is ', error);
        res.status(500).json({ message: "Server error", error: error.message })
    }
}

module.exports = {getProduct , getProductById ,createProduct, updateProduct , deleteProduct}