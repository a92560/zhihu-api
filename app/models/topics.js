const mongoose = require('mongoose')
const {
    Schema,
    model
} = mongoose
const topicSchema = new Schema({
    __v: {
        type: Number,
        select: false
    },
    name: {
        type: String,
        required: true,
        select: true
    },
    avatar_url: {
        type: String,
        select: true
    },
    introduction: {
        type: String,
        select: false
    }
})
module.exports = model('Topic', topicSchema)