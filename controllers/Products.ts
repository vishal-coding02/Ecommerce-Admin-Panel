import Product from "../models/ProductModel";
import Users from "../models/UserModel";
import { AuthenticatedRequest } from "../interfaces/Users";
import { Response } from "express";

async function createProducts(req: AuthenticatedRequest, res: Response) {
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
    await Product.create(newProduct);
    res.status(201).json({ message: "product added...!" });
  } else {
    res.status(403).json({ message: "Access denied. Admins only." });
  }
}

async function allProducts(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized. No user found." });
  }
  try {
    if (req.user.role === "admin") {
      const products = await Product.find();

      if (products.length > 0) {
        res.status(200).send({
          success: true,
          message: "Products fetched successfully.",
          data: products,
        });
      } else {
        res.status(404).json({
          success: false,
          message: "No products found.",
        });
      }
    } else {
      res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching products.",
    });
  }
}

async function updateStatus(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized. No user found." });
  }
  try {
    if (req.user.role === "admin") {
      const {
        category,
        subcategory,
      }: { category: string; subcategory: string[] } = req.body;
      const updatedProduct = await Product.updateMany(
        { productCategory: category },
        {
          $push: { productSubcategory: [subcategory] },
        }
      );
      if (updatedProduct) {
        res.status(200).json({
          success: true,
          message: "Product updated successfully.",
        });
      } else {
        res.status(404).json({ success: false, message: "Product not found." });
      }
    } else {
      res.status(403).json({ message: "Access denied. Admins only." });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong while updating product.",
    });
  }
}

async function updateStock(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized. No user found." });
  }
  try {
    if (req.user.role === "admin") {
      const { id, stock }: { id: string; stock: number } = req.body;
      const adminId = await Users.findOne({ userRole: "admin" }, { _id: 1 });
      const updateStock = await Product.findByIdAndUpdate(id, {
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
      } else {
        return res.status(404).json({
          success: false,
          message: "Product not found or stock unchanged.",
        });
      }
    } else {
      res.status(403).send({
        success: false,
        message: "Only admin can update stock.",
      });
    }
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "Something went wrong while updating stock.",
    });
  }
}

async function deleteProduct(req : AuthenticatedRequest, res : Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized. No user found." });
  }
  try {
    if (req.user.role === "admin") {
      const deleteResult = await Product.deleteOne({ _id: req.body.id });

      if (deleteResult) {
        res.status(200).json({
          success: true,
          message: "Product deleted successfully.",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Product not found or already deleted.",
        });
      }
    } else {
      res.status(403).json({
        success: false,
        message: "You are not authorized to perform this action.",
      });
    }
  } catch (err) {
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
