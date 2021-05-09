const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InvoiceSchema = new Schema({
	
	First_name: String,
	Last_name: String,
	Email: String,
	Contact: Number,
	Address: String,
	city: String,
	state: String,
	pincode: String,
	Date: Date,
	products:[
		{
			type: Schema.Types.ObjectId,
			ref: 'Product'
		}
	]
});

module.exports = mongoose.model('Invoice', InvoiceSchema)	
