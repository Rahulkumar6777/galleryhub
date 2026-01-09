import app from "./index.js"


app.listen(process.env.PORT , '0.0.0.0' , () => {
    console.log(`server is running at port ${process.env.PORT}`)
})