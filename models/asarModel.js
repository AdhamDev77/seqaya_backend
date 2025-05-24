const mongoose = require('mongoose');
const Draft_Asar = require('./draftAsarModel');
const Schema = mongoose.Schema;

const asarSchema = new Schema({
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
        default: 0,
    },
    kema_mogtama3ya: {
        type: Number,
        default: 0,
    },
    safy_kema_mogtama3ya: {
        type: Number,
        default: 0,
    },
    aed: {
        type: Number,
        default: 0,
    },
    draft: {
        type: Schema.Types.ObjectId, // Storing the _id of the draft Asar document
        ref: 'Draft_asar' // Referencing the Draft_Asar model
    },
    toggable_users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],

}, {timestamps: true});

module.exports = mongoose.model('Asar', asarSchema);
