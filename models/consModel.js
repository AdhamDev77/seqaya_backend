const mongoose = require('mongoose')

const Schema = mongoose.Schema

const consSchema = new Schema({
    cons_name: {
        type: String,
        required: true
    },
    cons_subject: {
        type: String,
        required: true,
    },
    cons_mos: {
        type: String,
        required: true,
    },
    cons_phone: {
        type: String,
        required: true
    },
    cons_message: {
        type: String,
        required: true
    },
    cons_comment: {
        type: Object,
        required: true
    },
    cons_time: {
        type: String,
        required: true
    },
    cons_seen: {
        type: String,
        required: true,
        default: "false"
    },
    cons_asar: { type: mongoose.Schema.Types.ObjectId, ref: 'Asar' },
}, {timestamps: true})

module.exports = mongoose.model('Cons', consSchema)