import { Model } from "../../../models/index.js"

export const get = async (req, res) => {
  try {
    const categoryId = req.query.categoryId
    const limit = parseInt(req.query.limit) || 10   
    const page = parseInt(req.query.page) || 1    

    const posts = await Model.File.find({ category: categoryId })
      .skip((page - 1) * limit)
      .limit(limit)

    const total = await Model.File.countDocuments({ category: categoryId })
    const totalPages = Math.ceil(total / limit)

    return res.status(200).json({
      message: "Success",
      posts,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    })

  } catch (error) {
    console.log(error)
    return res.status(500).json({
      error: "Internal Server Error"
    })
  }
}