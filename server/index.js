const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); 
const Product = require('./models/product');

const app = express();
app.use(cors());
app.use(express.json());

// 1. GET ALL PRODUCTS
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: "Error fetching products" });
    }
});

// 2. GET SINGLE PRODUCT
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: "Invalid ID format" });
    }
});

// 3. POST NEW PRODUCT
app.post('/api/products', async (req, res) => {
    try {
        const newProduct = new Product(req.body); 
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        res.status(400).json({ message: "Error adding product", error: err.message });
    }
});

// 4. DELETE PRODUCT
app.delete('/api/products/:id', async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) return res.status(404).json({ message: "Product not found" });
        res.json({ message: "Product deleted successfully!", product: deletedProduct });
    } catch (err) {
        res.status(500).json({ message: "Error deleting product" });
    }
});

// DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ DB Connected Successfully!"))
  .catch(err => console.log("❌ Connection Error:", err));

// START SERVER
app.listen(5000, () => console.log("🚀 Server is running on port 5000"));