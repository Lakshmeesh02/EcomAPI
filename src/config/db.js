const mongoose=require('mongoose')
const dotenv=require('dotenv')

dotenv.config()

const connectdb = async()=> {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true, 
            useUnifiedTopology: true,
        })
        console.log("mongodb connected")
    }
    catch(err) {
        console.log(err)
        process.exit(1)
    }
}

module.exports=connectdb