export const check = async (req, res) => {
    try {
        return res.status(200).json({
            message: "Authenticated"
        })
    } catch (error) {
        return res.status(500).json({
            error: "Internal Server Error"
        })
    }
}