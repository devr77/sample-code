const mongoose = require('mongoose');

const WishListSchema = new mongoose.Schema({
    follow:{
        type:Boolean,
        default:false
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User'
    },
    doctor:{
        type:mongoose.Schema.ObjectId,
        ref:'Doctor'
    }
});


const WishList = mongoose.model('WishList',WishListSchema);

module.exports = WishList;