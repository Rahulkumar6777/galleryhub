import mongoose from "mongoose";
import { Model } from "../../../models/index.js";

export const get = async (req, res) => {
  try {
    const { categoryId } = req.query;

    if (!categoryId) {
      return res.status(400).json({
        message: "categoryId is required"
      });
    }

    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    let filter = {};
    let sort = {};

  
    if (categoryId === "Recent") {
    
      sort = { createdAt: -1 };
    }
    else if (categoryId === "Popular") {
      sort = { impression: -1 };
    }
    else {
      filter.category = categoryId;
      sort = { createdAt: -1 };
    }

    const posts = await Model.File.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Model.File.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      message: "Success",
      posts,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });

  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({
        error: "Invalid categoryId"
      });
    }

    console.error(error);

    return res.status(500).json({
      error: "Internal Server Error"
    });
  }
};
