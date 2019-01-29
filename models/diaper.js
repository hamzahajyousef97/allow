const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const diaperSchema = new Schema({
    nameEN: {
        type: String,
        required: true,
    },
    nameAR: {
        type: String,
        required: true,
    },
    nameTR: {
        type: String,
        required: true,
    },
    descriptionEN: {
        type: String,
        required: true,
    },
    descriptionAR: {
        type: String,
        required: true,
    },
    descriptionTR: {
        type: String,
        required: true,
    },
    ilean: {
        type: Boolean,
        required: true,
        default: false,
    },
    allow: {
        type: Boolean,
        required: true,
        default: false,
    },
    ajyal: {
        type: Boolean,
        required: true,
        default: false,
    },
    imgOne: {
        type: String,
        required: true,
    },
    imgTwo: {
        type: String,
        required: true,
    },
    xs: {
        type: Boolean,
        required: true,
        default: false,
    },
    sm: {
        type: Boolean,
        required: true,
        default: false,
    },
    md: {
        type: Boolean,
        required: true,
        default: false,
    },
    lg: {
        type: Boolean,
        required: true,
        default: false,
    },
    xl: {
        type: Boolean,
        required: true,
        default: false,
    },
},{
    timestamps: true
});

var Diapers = mongoose.model('Diapers', diaperSchema);

module.exports = Diapers;