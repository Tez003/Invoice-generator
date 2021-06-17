const express = require('express');
const router = express.Router({mergeParams: true});
const Invoice = require('../modules/invoice');
const Product = require('../modules/product');
const Joi = require('joi');
const catchAsync = require('../utils/catchAsyn')
const ExpressError = require('../utils/ExpressError');
const methodOverride = require('method-override');
const { isLoggedIn } = require('../middleware');

router.get('', isLoggedIn, catchAsync(async(req, res)=>{
	const invoice = await Invoice.findById(req.params.id).populate('products');
	
	res.render('invoice/product',{invoice})
}));

router.post('', isLoggedIn,  catchAsync(async(req, res)=>{
	//if(!req.body.prdct) throw new ExpressError('Invalid Invoice data')
    const invoice = await Invoice.findById(req.params.id);
	const invoiceSchema = Joi.object({
		prdct: Joi.object({
			Product_name: Joi.string().required(),
			Quantity: Joi.number().required().min(0),
			Price: Joi.number().required().min(0),


		}).required()
	})
	const {error} = invoiceSchema.validate(req.body);

	if(error){
		/*const msg = error.details.map(el => el.message).join(',')
		throw new ExpressError(msg, 400)*/
        req.flash('Error', 'Invalid values has been entered. Please enter Positive Values in Quantity and Price section.');
		res.redirect(`/invoice/${invoice._id}/product`);
	}
    else{
	const prdct = new Product(req.body.prdct);
	invoice.products.push(prdct);
	await prdct.save();
	await invoice.save();
    req.flash('Success', 'Successfully added a new product');
	res.redirect(`/invoice/${invoice._id}/product`);
    }
}));
router.post('/:pr_id', isLoggedIn,  catchAsync(async(req, res) =>{
	
	const invoice = await Invoice.findById(req.params.id);
	const product = await Product.findByIdAndDelete(req.params.pr_id)
	req.flash('Success', 'Successfully deleted the product');
	res.redirect(`/invoice/${invoice._id}/product`);
	//res.send("delete request")

}));

module.exports = router;