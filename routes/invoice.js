const express = require('express');
const router = express.Router();
const Invoice = require('../modules/invoice');
const User = require('../modules/user');
const catchAsync = require('../utils/catchAsyn')
const ExpressError = require('../utils/ExpressError');
const JOi = require('joi');
const methodOverride = require('method-override');
const { isLoggedIn } = require('../middleware');
const passport = require('passport');

router.get('/', isLoggedIn,  catchAsync(async(req, res) => {
	
	//const invoices = await Invoice.find({});
	//const invoice = await Invoice.findById(req.params.id).populate('products');
	const user = await User.findById(req.user._id).populate('invoices')
    
    res.render('invoice/index', {user});
}));

router.get('/new', isLoggedIn, (req, res)=>{
	res.render('invoice/new')
})

router.post('/', isLoggedIn, catchAsync(async(req, res, next)=>{
	
		//if(!req.body.invoice) throw new ExpressError('Invalid Invoice data')'
		/*const invoiceSchema = Joi.object({
			invoice: Joi.object({
				First_name: Joi.string().required(),
				Last_name: Joi.string().required(),
				Contact: Joi.string().required().min(100000000),


			}).required()
		})
		const {error} = invoiceSchema.validate(req.body);
	
		if(error){
			const msg = error.details.map(el => el.message).join(',')
			throw new ExpressError(msg, 400)
		}*/
		const user = await User.findById(req.user._id);
		const invoice = new Invoice(req.body.invoice);
		user.invoices.push(invoice);
		await invoice.save();
		await user.save();
        req.flash('Success', 'Successfully added a new client');
		res.redirect(`/invoice/${invoice._id}`);
}))




router.get('/:id', isLoggedIn,  catchAsync(async(req, res,) =>{
	const invoice = await Invoice.findById(req.params.id)
    if(!invoice){
        req.flash('Error', 'Client details has been deleted');
		res.redirect('/invoice');
    }
	res.render('invoice/show', {invoice}, );
})); 

router.get('/:id/edit', isLoggedIn,  catchAsync(async(req, res) =>{
	const invoice = await Invoice.findById(req.params.id)
	res.render('invoice/edit',{invoice});
}));

router.put('/:id', isLoggedIn,  catchAsync(async(req, res) =>{
	const { id } = req.params;
	const invoice = await Invoice.findByIdAndUpdate(id, {...req.body.invoice})
    req.flash('Success', 'Successfully Updated');
	res.redirect(`/invoice/${invoice._id}/`);

}));

router.delete('/:id', isLoggedIn,  catchAsync(async(req, res) =>{
	const { id } = req.params;
	const invoice = await Invoice.findByIdAndDelete(id)

	req.flash('Success', 'Successfully Deleted');
	res.redirect('/invoice');

}));

router.get('/:id/invoice',  catchAsync(async(req, res) =>{
	const {id} = req.params;
	const invoice = await Invoice.findById(id).populate('products');

	const user = await User.findOne({}, {'invoices._id': id});
	res.render('invoice/invoice', {invoice, user});
	
}))

module.exports = router;