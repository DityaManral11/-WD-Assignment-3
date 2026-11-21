
const validateProduct = (req, res, next) => {
    const {
        name,
        sku,
        category,
        price,
        quantity,
        supplier,
        reorderLevel
    } = req.body;

    // Check required fields
    if (
        !name ||
        !sku ||
        !category ||
        !supplier ||
        price === undefined ||
        quantity === undefined
    ) {
        return res.status(400).json({
            message: "All required product fields must be provided"
        });
    }

    // Check data types
    if (
        typeof name !== "string" ||
        typeof sku !== "string" ||
        typeof category !== "string" ||
        typeof supplier !== "string"
    ) {
        return res.status(400).json({
            message: "Name, SKU, category and supplier must be strings"
        });
    }

    // Check numeric values
    if (
        typeof price !== "number" ||
        typeof quantity !== "number" ||
        price < 0 ||
        quantity < 0
    ) {
        return res.status(400).json({
            message: "Price and quantity must be non-negative numbers"
        });
    }

    if (
        reorderLevel !== undefined &&
        (typeof reorderLevel !== "number" || reorderLevel < 0)
    ) {
        return res.status(400).json({
            message: "Reorder level must be a non-negative number"
        });
    }

    next();
};

export default validateProduct;
