import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import productRoutes from "./routes/productRoutes.js"
import errorHandler from "./middleware/errorHandler.js";;

dotenv.config();

const app = express();

app.use(express.json());
app.use("/api/products", productRoutes);

connectDB();

app.get("/", (req, res) => {
    res.send("Inventory Management System API is Running!");
});

// Handle undefined routes

app.use((req, res, next) => {
    const error = new Error("Route Not Found");
    error.statusCode = 404;
    next(error);
});

// Centralized error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
