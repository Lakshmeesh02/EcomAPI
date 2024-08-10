const mongoose=require('mongoose')

const orderschema=new mongoose.Schema({
    userId: { type: String, required: true}, 
    products: [ {
        productId: {type: mongoose.Schema.Types.ObjectId, ref: 'Product', requiured: true},
        quantity: { type: Number, required: true, min: 1},
    }],
    totalamount: {type: Number, required: true},
})

const ordersModel=mongoose.model('Order', orderschema)
module.exports=ordersModel