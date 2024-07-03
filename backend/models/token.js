const { ref } = require('joi');
const mongoose= require('mongoose');

const refreshTokenSchema=new mongoose.Schema({
    token:{type:String,require:true},
    userId:{type:mongoose.SchemaTypes.ObjectId,ref:'User '},

},
{timestamps:true}
);
const tokenmodel = mongoose.model('Token', refreshTokenSchema);
module.exports.RefreshToken= tokenmodel;
