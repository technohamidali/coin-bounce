const { ref } = require('joi');
const mongoose = require('mongoose');
const commentSchema = new mongoose.Schema({
    content: { type: String, required: true },
    blog: { type: mongoose.SchemaTypes.ObjectId, ref: 'Blog' },
    author: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },


},

    { timestamps: true }

);
const commentmodel = mongoose.model('Comment', commentSchema);
module.exports.commentmodel = commentmodel;