const productModel = require("../models/product.model")
const cloudinary= require("../config/cloudinary")

async function getProduct(req,res){
    try{
        const products = await productModel.find();
        res.status(200).json({
            message:"Products fetch sucessfully..",
            products
        })

    }catch(error){
        console.log("message is :",error)
    }

}
async function getProductById(req,res){
    try{
        const projectId = await productModel.findById(req.params.id);
        if(projectId){
            res.status(200).json(projectId)
        }else{
            res.status(500).json({
                message :"Product not found...."
            })
        }

    }catch(error){
        console.log("Message project Id is ", error)
    }
}

async function createProduct(req,res){
    try{
        const {name , description , price , category , stock}=req.body;
    let imageUrl = "";
    if(req.file){
        const result = await cloudinary.uploader.upload(req.file.path);
        imageUrl=result.secure_url;
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
            message:"Server error",error
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

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            product.imageUrl = result.secure_url; 
        }
        
        const updatedProduct = await product.save();
        res.status(200).json(updatedProduct); 

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Server error"
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
                message:"server error"
            })

        }
    }catch(error){
        console.log('Message is ', error);
        
    }
}
module.exports = {getProduct , getProductById ,createProduct, updateProduct , deleteProduct}