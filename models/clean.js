const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
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
    imgOne: {
        type: String,
        required: true,
    },
    imgTwo: {
        type: String,
        required: true,
    },
},{
    timestamps: true
});

const cleanSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    products: [ProductSchema]
},{
    timestamps: true
});

var Cleans = mongoose.model('Cleans', cleanSchema);

module.exports = Cleans;