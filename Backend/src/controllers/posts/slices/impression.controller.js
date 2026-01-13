import mongoose from "mongoose";
import { Model } from "../../../models/index.js";

const impression = async (req, res) => {
  try {
    const { postid } = req.params;

    const result = await Model.File.updateOne(
      { _id: postid },
      { $inc: { impression: 1 } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        error: "File not found"
      });
    }

    return res.status(200).json({
      message: "Success"
    });

  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({
        error: "Invalid file id"
      });
    }

    return res.status(500).json({
      error: "Internal Server Error"
    });
  }
};

export {impression};
