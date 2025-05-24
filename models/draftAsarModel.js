const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const draftAsarSchema = new Schema({
    project_info: {
        type: Object,
        required: true
    },
    project_goals_1: {
        type: Object,
    },
    project_goals_2: {
        type: Object,
    },
    project_tahlils: {
        type: Object,
    },
    m3neen: {
        type: Object,
    },
    project_natiga: {
        type: Object,
    },
    mod5alat: {
        type: Number,
    },
}, {timestamps: true});

module.exports = mongoose.model('Draft_asar', draftAsarSchema);
