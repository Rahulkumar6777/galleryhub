import app from "./index.js"

// routes
import adminRoutes from './src/routes/admin.Routes.js'


app.use('/api/v1/admin', adminRoutes)

app.listen(process.env.PORT , '0.0.0.0' , () => {
    console.log(`server is running at port ${process.env.PORT}`)
})