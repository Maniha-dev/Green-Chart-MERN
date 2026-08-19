
import { v2 as cloudinary } from "cloudinary"
import Product from "../models/product.js"



// Add Product : /api/product/add
export const addProduct = async (req, res) => {
    try {
        let productData = JSON.parse(req.body.productData)

        const images = req.files

        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                return result.secure_url
            })
        )

        const product = await Product.create({
            ...productData,
            price: Number(productData.price),
            offerPrice: Number(productData.offerPrice),
            image: imagesUrl,
        })

        console.log('PRODUCT SAVED SUCCESSFULLY:', product._id.toString());

        res.json({ success: true, message: "Product Added" })
    } catch (error) {
        console.error('PRODUCT SAVE ERROR:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// Get Product List : /api/product/list
export const productList = async (req, res) => {
    try {
        const products = await Product.find({})
        res.json({ success: true, products })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Get single Product : /api/product/id
export const productById = async (req, res) => {
    try {
        const { id } = req.body
        const product = await Product.findById(id)
        res.json({ success: true, product })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Change Product inStock : /api/product/stock
export const changeStock = async (req, res) => {
    try {
        const { id, inStock } = req.body
        await Product.findByIdAndUpdate(id, { inStock })
        res.json({ success: true, message: "Stock Updated" })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}