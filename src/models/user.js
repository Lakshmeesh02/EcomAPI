const mongoose=require('mongoose')

const userschema=new mongoose.Schema({
    username: {type: String, required: true}, 
    password: {type: String, required: true}, 

})

const user=mongoose.model('User', userschema)
module.exports=user;