const mongoose=require('mongoose');

const blogSchema=new mongoose.Schema({
    title:{type: String, required: true},
    content:{type:String, required:true},
    photoPath:{type:String, required:true},
    author:{type:mongoose.SchemaTypes.ObjectId, ref:'User'},
},
    
    {timestamps:true}

);
const blogsmodel = mongoose.model('Blog', blogSchema);
module.exports.Blog=blogsmodel;