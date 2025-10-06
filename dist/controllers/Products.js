"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ProductModel_1 = __importDefault(require("../models/ProductModel"));
const UserModel_1 = __importDefault(require("../models/UserModel"));
async function createProducts(req, res) {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized. No user found." });
    }
    if (req.user.role === "admin") {
        const newProduct = {
            productName: req.body.name,
            productPrice: req.body.price,
            productDescription: req.body.description,
            productStockCount: 0,
            productImg: "",
            productCategory: req.body.category,
            productSubcategory: req.body.subCategory,
            createdAt: new Date().toISOString(),
        };
        await ProductModel_1.default.create(newProduct);
        res.status(201).json({ message: "product added...!" });
    }
    else {
        res.status(403).json({ message: "Access denied. Admins only." });
    }
}
async function allProducts(req, res) {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized. No user found." });
    }
    try {
        if (req.user.role === "admin") {
            const products = await ProductModel_1.default.find();
            if (products.length > 0) {
                res.status(200).send({
                    success: true,
                    message: "Products fetched successfully.",
                    data: products,
                });
            }
            else {
                res.status(404).json({
                    success: false,
                    message: "No products found.",
                });
            }
        }
        else {
            res.status(403).json({
                success: false,
                message: "Access denied. Admins only.",
            });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Something went wrong while fetching products.",
        });
    }
}
async function updateStatus(req, res) {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized. No user found." });
    }
    try {
        if (req.user.role === "admin") {
            const { category, subcategory, } = req.body;
            const updatedProduct = await ProductModel_1.default.updateMany({ productCategory: category }, {
                $push: { productSubcategory: [subcategory] },
            });
            if (updatedProduct) {
                res.status(200).json({
                    success: true,
                    message: "Product updated successfully.",
                });
            }
            else {
                res.status(404).json({ success: false, message: "Product not found." });
            }
        }
        else {
            res.status(403).json({ message: "Access denied. Admins only." });
        }
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: "Something went wrong while updating product.",
        });
    }
}
async function updateStock(req, res) {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized. No user found." });
    }
    try {
        if (req.user.role === "admin") {
            const { id, stock } = req.body;
            const adminId = await UserModel_1.default.findOne({ userRole: "admin" }, { _id: 1 });
            const updateStock = await ProductModel_1.default.findByIdAndUpdate(id, {
                $inc: {
                    productStockCount: stock,
                },
                $set: {
                    modifiedBy: adminId,
                    updatedAt: new Date().toString(),
                },
            });
            if (updateStock) {
                return res.status(200).json({
                    success: true,
                    message: "Stock updated successfully.",
                });
            }
            else {
                return res.status(404).json({
                    success: false,
                    message: "Product not found or stock unchanged.",
                });
            }
        }
        else {
            res.status(403).send({
                success: false,
                message: "Only admin can update stock.",
            });
        }
    }
    catch (err) {
        res.status(500).send({
            success: false,
            message: "Something went wrong while updating stock.",
        });
    }
}
async function deleteProduct(req, res) {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized. No user found." });
    }
    try {
        if (req.user.role === "admin") {
            const deleteResult = await ProductModel_1.default.deleteOne({ _id: req.body.id });
            if (deleteResult) {
                res.status(200).json({
                    success: true,
                    message: "Product deleted successfully.",
                });
            }
            else {
                res.status(404).json({
                    success: false,
                    message: "Product not found or already deleted.",
                });
            }
        }
        else {
            res.status(403).json({
                success: false,
                message: "You are not authorized to perform this action.",
            });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Something went wrong while deleting the product.",
        });
    }
}
module.exports = {
    createProducts,
    allProducts,
    updateStatus,
    updateStock,
    deleteProduct,
};
