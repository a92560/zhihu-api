const mongoose = require('mongoose')
const {
    Schema,
    model
} = mongoose
const commentSchema = new Schema({
    __v: {
        type: Number,
        select: false
    },
    content: {
        type: String,
        required: true,
        select: true
    },
    commentator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        select: true,
        required: true
    },
    answerId: {
        type: Schema.Types.ObjectId,
        ref: 'Answer',
        select: true,
        required: true
    },
    questionId: {
        type: Schema.Types.ObjectId,
        ref: 'Question',
        select: true,
        required: true
    },
    rootCommentId:{
        required: false,
        type: String
    },
    replyTo: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
}, { timestamps: true})
module.exports = model('Comment', commentSchema)