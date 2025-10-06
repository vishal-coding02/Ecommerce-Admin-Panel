"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UserModel_1 = __importDefault(require("../models/UserModel"));
const CartModel_1 = __importDefault(require("../models/CartModel"));
async function addToCart(req, res) {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized. No user found." });
    }
    try {
        if (req.user.role === "user") {
            const { product } = req.body;
            let totalPrice = 0;
            for (let item of product) {
                const productData = (await UserModel_1.default.findOne({ productName: item.name }, { productPrice: 1 }));
                if (productData) {
                    totalPrice += productData.productPrice * item.quantity;
                }
            }
            let newCart = {
                userId: req.body.id,
                products: req.body.product,
                totalPrice: totalPrice,
                totalItem: product.length,
                orderStatus: "Pending",
                createdAt: new Date().toString(),
            };
            console.log(newCart);
            await CartModel_1.default.create(newCart);
            res.status(201).json({
                success: true,
                message: "Product added to cart successfully.",
            });
        }
        else {
            res.status(403).json({
                success: false,
                message: "Only users can add to cart.",
            });
        }
    }
    catch (err) {
        console.error("Cart Creation Error:", err);
        res.status(500).json({
            success: false,
            message: "Something went wrong. Please try again.",
        });
    }
}
async function allCartItems(req, res) {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized. No user found." });
    }
    try {
        if (req.user.role === "user") {
            const myCart = await CartModel_1.default.findOne({ userId: req.params.id });
            if (!myCart || myCart.products.length === 0) {
                return res.status(204).json({
                    success: false,
                    message: "Your cart is empty.",
                });
            }
            res.status(200).json({
                success: true,
                message: "Cart fetched successfully.",
                cart: myCart,
            });
        }
        else {
            res.status(403).json({
                success: false,
                message: "Only users can access the cart.",
            });
        }
    }
    catch (err) {
        console.error("Cart Fetch Error:", err);
        res.status(500).json({
            success: false,
            message: "Something went wrong while fetching your cart.",
        });
    }
}
async function removeCart(req, res) {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized. No user found." });
    }
    try {
        if (req.user.role === "user") {
            const deletedCart = await CartModel_1.default.findOneAndDelete({
                userId: req.params.id,
            });
            if (!deletedCart) {
                return res.status(404).json({
                    success: false,
                    message: "No cart found to delete.",
                });
            }
            res.status(200).json({
                success: true,
                message: "Cart deleted successfully.",
                cart: deletedCart,
            });
        }
        else {
            res.status(403).json({
                success: false,
                message: "Only users can access the cart.",
            });
        }
    }
    catch (err) {
        console.error("Cart Deletion Error:", err);
        res.status(500).json({
            success: false,
            message: "Something went wrong while deleting the cart.",
        });
    }
}
module.exports = { addToCart, allCartItems, removeCart };
