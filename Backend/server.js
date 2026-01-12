import app from "./index.js"
import cors from "cors"
// routes
import adminRoutes from './src/routes/admin.Routes.js'
import publicRoutes from './src/routes/public.Routes.js'

const corsOption = {
    origin: ['http://localhost:5173'],
    methods: ['GET'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}

const privateCorsOptions = {
    origin: ['https://api-galleryhub.cloudcoderhub.in'],
    methods: ['GET'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization' , 'x-code']
}

app.use('/api/v1/admin', cors(privateCorsOptions), adminRoutes)
app.use('/api/v1/public', cors(corsOption) , publicRoutes)

app.listen(process.env.PORT , '0.0.0.0' , () => {
    console.log(`server is running at port ${process.env.PORT}`)
})