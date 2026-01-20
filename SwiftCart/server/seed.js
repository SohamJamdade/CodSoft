const mongoose = require('mongoose');
require('dotenv').config(); // This allows seed.js to read your .env file
const Product = require('./models/product');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("✅ Connected to MongoDB for seeding...");

        await Product.deleteMany({}); // Clear existing products
        console.log("🗑️  Existing products cleared.");

        const sampleProducts = [
            {
                name: "Nike Air Max 270",
                description: "Experience the comfort of Nike Air Max 270 with its sleek design and superior cushioning.",
                price: 150,
                category: "Footwear",
                image: "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/gorfwjchoasrrzr1fggt/AIR+MAX+270.png",
                stock: 50
            },
            {
                name: "Adidas hoodie",
                description: "Stay cozy and stylish with our premium Adidas hoodie.",
                price: 80,
                category: "Clothing",
                image: "https://assets.adidas.com/images/w_766,h_766,f_auto,q_auto,fl_lossy,c_fill,g_auto/44df7b749a244025b14ea0b8021dd2bf_9366/future-icons-3-stripes-fullzip-hoodie.jpg",
                stock: 25
            },
            {
                name: "Apple AirPods Pro",
                description: "Immerse yourself in superior sound quality with Apple AirPods Pro.",
                price: 249,
                category: "Electronics",
                image: "https://sm.mashable.com/t/mashable_in/article/a/apple-airp/apple-airpods-pro-3-every-single-thing-we-know-so-far_ycjz.2496.jpg",
                stock: 40 // <-- Added stock field
            },
            {
                name: "Gaming Monitor",
                description: "27-inch 144Hz 4K Display",
                price: 300,
                category: "Electronics",
                image: "https://elitehubs.com/cdn/shop/files/in-odyssey-oled-g6-g60sd-ls27dg600swxxl-541957578.png?v=1733735149&width=720",
                stock: 10
            }
        ];

        await Product.insertMany(sampleProducts);
        console.log("🌱 Sample products seeded!");

        mongoose.connection.close();
    })
    .catch(err => {
        console.error("❌ Error connecting to MongoDB:", err);
    });

