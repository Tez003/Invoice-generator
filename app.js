const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const Joi = require('joi');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');


const catchAsync = require('./utils/catchAsyn')
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override')
const Invoice = require('./modules/invoice');
const Product = require('./modules/product');
const User = require('./modules/user');


const invoiceRoutes = require('./routes/invoice');
const productRoutes = require('./routes/product');
const userRoutes = require('./routes/user');







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

app.use(express.json());



app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'))
app.use(express.static( path.join(__dirname, 'public')))
app.use(cookieParser());

const sessionConfig = {
	secret : "secret",
	resave: false,
	saveUninitialized: true,
	cookie: {
		httoOnly: true,
		expires: Date.now() + 1000*60*60*24,
		maxAge:1000*60*60*24
	}

}
app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next)=>{
	res.locals.currentUser = req.user;
	res.locals.success = req.flash('Success')
	res.locals.error = req.flash('Error')
	next();
})



app.use('/', userRoutes);
app.use('/invoice', invoiceRoutes)
app.use('/invoice/:id/product', productRoutes)






app.get('/', (req, res) => {
	res.render('home')
});




app.all('*', (req, res, next) =>{
	next(new ExpressError('Page Not Found', 404))
	
})

app.use((err, req, res, next) =>{
	const {statusCode = 500} = err;
	if(!err.message) err.message = "Something went wrong!"
	res.status(statusCode).render('error', {err});
	//res.send("Error occurred");
})

async function isLoggedin(req, res, next){
    if (!req.isAuthenticated()) {
        const accessToken = req.cookies.accessToken;

        jwt.verify(accessToken, JWT_AUTH_TOKEN, async (err, phone) => {
            if (phone) {
                req.phone = phone;
                next();
            } else if (err.message === 'TokenExpiredError') {
                return res.status(403).send({
                    success: false,
                    msg: 'Access token expired'
                });
            } else {
                console.log(err);
                return res.status(403).send({ err, msg: 'User not authenticated' });
            }
        });
}
}



app.listen(3000, () => {
	console.log('Serving on Port 3000')
})