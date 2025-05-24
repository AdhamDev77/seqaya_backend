const mongoose = require('mongoose')

const Schema = mongoose.Schema

const makalSchema = new Schema({
    makal_title: {
        type: String,
        required: true
    },
    makal_description: {
        type: String,
        required: true,
    },
    makal_type: {
        type: String,
        required: true
    },
    makal_link: {
        type: String,
        required: true,
    },
    makal_img: {
        type: String,
        required: true
    },
}, {timestamps: true})

module.exports = mongoose.model('Makal', makalSchema)