const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    Product_name: String,
    Price: Number,
    Quantity: Number,

})

module.exports = mongoose.model("Product", ProductSchema);



