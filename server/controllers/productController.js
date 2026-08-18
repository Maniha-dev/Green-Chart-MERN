import { v2 as cloudinary } from 'cloudinary';
import { unlink } from 'node:fs/promises';
import Product from '../models/product.js';

const removeLocalFile = async (filePath) => {
    if (!filePath) return;

    try {
        await unlink(filePath);
    } catch (error) {
        // The upload may already have removed the temporary file.
        if (error.code !== 'ENOENT') {
            console.warn('Could not remove temporary upload:', error.message);
        }
    }
};

const getCloudinaryError = (error) => ({
    message: error?.message,
    http_code: error?.http_code,
    name: error?.name,
    body: error?.error,
    response_body: error?.response?.body,
});

// Add Product: /api/product/add
export const addProduct = async (req, res) => {
    const files = Array.isArray(req.files) ? req.files.filter(Boolean) : [];

    try {
        if (!req.body.productData) {
            return res.status(400).json({
                success: false,
                message: 'Product data is required.',
            });
        }

        if (files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please select at least one product image.',
            });
        }

        let productData;

        try {
            productData = JSON.parse(req.body.productData);
        } catch {
            return res.status(400).json({
                success: false,
                message: 'Product data must be valid JSON.',
            });
        }

        const { name, description, category, price, offerPrice } = productData;

        if (!name || !category || price === undefined || offerPrice === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Name, category, price, and offer price are required.',
            });
        }

        const uploadedImages = [];

        for (const file of files) {
            try {
                const result = await cloudinary.uploader.upload(file.path, {
                    resource_type: 'image',
                    folder: 'green-cart/products',
                });

                uploadedImages.push(result.secure_url);
            } catch (error) {
                console.error('Cloudinary upload failed:', getCloudinaryError(error));

                const statusCode = Number.isInteger(error?.http_code)
                    ? error.http_code
                    : 500;

                return res.status(statusCode).json({
                    success: false,
                    message:
                        error?.http_code === 403
                            ? 'Cloudinary rejected this upload with HTTP 403. Check the active product environment, API key, API secret, and Upload API access.'
                            : error.message || 'Cloudinary upload failed.',
                });
            } finally {
                await removeLocalFile(file.path);
            }
        }

        const product = await Product.create({
            name: name.trim(),
            description: Array.isArray(description) ? description : [description || ''],
            category,
            price: Number(price),
            offerPrice: Number(offerPrice),
            image: uploadedImages,
        });

        return res.status(201).json({
            success: true,
            message: 'Product Added',
            product,
        });
    } catch (error) {
        for (const file of files) {
            await removeLocalFile(file.path);
        }

        console.error('Add product failed:', error);

        return res.status(500).json({
            success: false,
            message: error.message || 'Could not add product.',
        });
    }
};

// Get Product List: /api/product/list
export const productList = async (req, res) => {
    try {
        const products = await Product.find({});
        return res.json({ success: true, products });
    } catch (error) {
        console.error('Get product list failed:', error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get Single Product: /api/product/id
export const productById = async (req, res) => {
    try {
        const { id } = req.body;
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        return res.json({ success: true, product });
    } catch (error) {
        console.error('Get product failed:', error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Change Product Stock: /api/product/stock
export const changeStock = async (req, res) => {
    try {
        const { id, inStock } = req.body;
        const product = await Product.findByIdAndUpdate(
            id,
            { inStock: Boolean(inStock) },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        return res.json({ success: true, message: 'Stock Updated', product });
    } catch (error) {
        console.error('Change stock failed:', error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};
