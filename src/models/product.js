const mongoose=require('mongoose')

const productschema=new mongoose.Schema({
    productname: {type: String, required: true}, 
    price: {type: Number, required: true}, 
    description: {type: String}, 
    category: {type: String}
})

const product=mongoose.model('Product', productschema)
module.exports=product