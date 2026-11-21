
import express from "express";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import validateProduct from "../middleware/validateProduct.js";

const router = express.Router();


// 1. POST - Create Product
router.post("/", validateProduct, async (req, res) => {
    try {
        const product = new Product(req.body);
        const savedProduct = await product.save();

        res.status(201).json(savedProduct);

    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});


// 2. GET - All Products with Search, Filtering,
// Sorting and Pagination
router.get("/", async (req, res) => {
    try {
        const {
            category,
            search,
            minPrice,
            maxPrice,
            sort = "-createdAt",
            page = 1,
            limit = 10
        } = req.query;

        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        if (
            !Number.isInteger(pageNumber) ||
            !Number.isInteger(limitNumber) ||
            pageNumber < 1 ||
            limitNumber < 1 ||
            limitNumber > 100
        ) {
            return res.status(400).json({
                message: "Invalid page or limit"
            });
        }

        // Filtering
        const filter = {};

        if (category) {
            filter.category = category;
        }

        // Search by name, SKU or category
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { sku: { $regex: search, $options: "i" } },
                { category: { $regex: search, $options: "i" } }
            ];
        }

        // Price filtering
        if (minPrice !== undefined || maxPrice !== undefined) {
            filter.price = {};

            if (minPrice !== undefined) {
                filter.price.$gte = Number(minPrice);
            }

            if (maxPrice !== undefined) {
                filter.price.$lte = Number(maxPrice);
            }

            if (
                Object.values(filter.price).some(
                    value => !Number.isFinite(value)
                )
            ) {
                return res.status(400).json({
                    message: "Invalid price range"
                });
            }
        }

        // Sorting
        const sortOption = {};

        if (sort === "price") {
            sortOption.price = 1;
        } else if (sort === "-price") {
            sortOption.price = -1;
        } else if (sort === "name") {
            sortOption.name = 1;
        } else if (sort === "-name") {
            sortOption.name = -1;
        } else {
            sortOption.createdAt = -1;
        }

        // Pagination
        const skip = (pageNumber - 1) * limitNumber;

        const products = await Product.find(filter)
            .sort(sortOption)
            .skip(skip)
            .limit(limitNumber);

        const total = await Product.countDocuments(filter);

        res.status(200).json({
            total,
            page: pageNumber,
            totalPages: Math.ceil(total / limitNumber),
            count: products.length,
            products
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// 3. GET - Low Stock Products
router.get("/low-stock", async (req, res) => {
    try {
        const lowStockItems = await Product.find({
            $expr: {
                $lte: ["$quantity", "$reorderLevel"]
            }
        });

        res.status(200).json({
            count: lowStockItems.length,
            lowStockItems
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// 4. GET - Category-wise Inventory Summary
router.get("/summary", async (req, res) => {
    try {
        const summary = await Product.aggregate([
            {
                $group: {
                    _id: "$category",
                    totalItems: { $sum: 1 },
                    totalQuantity: { $sum: "$quantity" },
                    totalStockValue: {
                        $sum: {
                            $multiply: ["$price", "$quantity"]
                        }
                    },
                    avgPrice: { $avg: "$price" }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        res.status(200).json({
            categories: summary.length,
            summary
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// 5. GET - Single Product by ID
router.get("/:id", async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid Product ID"
            });
        }

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json(product);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// 6. PUT - Update Product
router.put("/:id", validateProduct, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid Product ID"
            });
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedProduct) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json(updatedProduct);

    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});


// 7. DELETE - Delete Product
router.delete("/:id", async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid Product ID"
            });
        }

        const deletedProduct = await Product.findByIdAndDelete(
            req.params.id
        );

        if (!deletedProduct) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Product deleted successfully",
            id: deletedProduct._id
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// 8. PATCH - Stock Adjustment
router.patch("/:id/stock", async (req, res) => {
    try {
        const { change } = req.body;

        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid Product ID"
            });
        }

        if (
            typeof change !== "number" ||
            !Number.isInteger(change) ||
            change === 0
        ) {
            return res.status(400).json({
                message: "Change must be a non-zero integer"
            });
        }

        // Prevent stock from becoming negative
        const filter = {
            _id: req.params.id
        };

        if (change < 0) {
            filter.quantity = { $gte: Math.abs(change) };
        }

        const updatedProduct = await Product.findOneAndUpdate(
            filter,
            {
                $inc: { quantity: change }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedProduct) {
            const exists = await Product.exists({
                _id: req.params.id
            });

            return res.status(exists ? 400 : 404).json({
                message: exists
                    ? "Insufficient stock"
                    : "Product not found"
            });
        }

        res.status(200).json({
            message: "Stock updated successfully",
            product: updatedProduct
        });

    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});


export default router;
