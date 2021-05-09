const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate')
const methodOverride = require('method-override')
const Invoice = require('./modules/invoice');
const Product = require('./modules/product');


mongoose.connect('mongodb://localhost:27017/invoice-generator',
				{
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology:true
});
mongoose.set('useFindAndModify', false);


const db = mongoose.connection;
db.on("error", console.error.bind(console,"connection error:"));
db.once("open", () => {
	console.log("Database Connected")
})


const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'))

app.get('/', (req, res) => {
	res.render('home')
});


app.get('/invoice', async(req, res) => {
	const invoices = await Invoice.find({});
    res.render('invoice/index', {invoices})
});

app.get('/invoice/new', (req, res)=>{
	res.render('invoice/new')
})

app.post('/invoice', async(req, res)=>{
	const invoice = new Invoice(req.body.invoice);
	await invoice.save();
	res.redirect(`/invoice/${invoice._id}`);
})




app.get('/invoice/:id', async(req, res,) =>{
	const invoice = await Invoice.findById(req.params.id)
	res.render('invoice/show', {invoice});
}); 

app.get('/invoice/:id/edit', async(req, res) =>{
	const invoice = await Invoice.findById(req.params.id)
	res.render('invoice/edit',{invoice});
})

app.put('/invoice/:id', async(req, res) =>{
	const { id } = req.params;
	const invoice = await Invoice.findByIdAndUpdate(id, {...req.body.invoice})
	res.redirect(`/invoice/${invoice._id}/`);

})

app.delete('/invoice/:id', async(req, res) =>{
	const { id } = req.params;
	const invoice = await Invoice.findByIdAndDelete(id)
	res.redirect('/invoice');

})

app.get('/invoice/:id/product', async(req, res)=>{
	const invoice = await Invoice.findById(req.params.id).populate('products');
	
	res.render('invoice/product',{invoice})
})

app.post('/invoice/:id/product', async(req, res)=>{
	const invoice = await Invoice.findById(req.params.id);
	const prdct = new Product(req.body.prdct);
	invoice.products.push(prdct);
	await prdct.save();
	await invoice.save();
	res.redirect(`/invoice/${invoice._id}/product`);
})

app.listen(3000, () => {
	console.log('Serving on Port 3000')
})