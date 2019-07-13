const mongoose = require('mongoose')
const {
    Schema,
    model
} = mongoose
const answerSchema = new Schema({
    __v: {
        type: Number,
        select: false
    },
    content: {
        type: String,
        required: true,
        select: true
    },
    answerer: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        select: true,
        required: true
    },
    questionId: {
        type: String,
        required: true,
        select: true
    },
    voteCount: {
        type: Number,
        required: true,
        default: 0,
        select: true
    }
})
module.exports = model('Answer', answerSchema)