import { Model } from "../../../models/index.js";

export const Login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: "username and password is required"
            })
        }

        const admin = await Model.Admin.findOne({ username })
        if (!admin) {
            return res.status(400).json({
                message: "Invalid credentials"
            })
        }

        const matchpass = await admin.checkpassword(password)
        if (!matchpass) {
            return res.status(400).json({
                message: "Invalid credentials"
            })
        }

        const token = await admin.generateAuthToken();

        const LocalHostTokenOption = {
            httpOnly: true,
            secure: false,
            sameSite: 'Lax',
            expires: new Date(Date.now() + 2 * 60 * 60 * 1000)
        };

        const DeploymentTokenOption = {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict',
            domain: ".cloudcoderhub.in",
            expires: new Date(Date.now() + 2 * 60 * 60 * 1000)
        };
        const option = process.env.NODE_ENV === "production" ? DeploymentTokenOption : LocalHostTokenOption
        return res.status(200)
            .cookie("Token", token, option)
            .json({
                message: "success"
            })

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            error: "Internal Server Error"
        })
    }
}