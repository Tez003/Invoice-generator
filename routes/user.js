const express = require('express');
const router = express.Router({mergeParams: true});
const User = require('../modules/user');
const catchAsync = require('../utils/catchAsyn');
const passport = require('passport');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config()

const account_sid = process.env.ACCOUNT_SID
const account_token = process.env.ACCOUNT_AUTH_TOKEN
const JWT_AUTH_TOKEN = process.env.JWP_AUTH_TOKEN
const JWT_REFRESH_TOKEN = process.env.JWP_REFRESH_TOKEN
const sms_key = process.env.SMS_SECRET_KEY
const client = require('twilio')(account_sid, account_token)
let refreshTokens = [];

router.get('/register', (req, res) =>{
    res.render('user/register');
})

router.post('/register', catchAsync(async (req, res, next) => {
    try {
        const { email, username,phone, password } = req.body;
        const user = new User({ email, phone, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Accout created Successfully! Time to verify your phone number.');
            res.redirect('/login');
        })
    } catch (e) {
        req.flash('Error', e.message);
        res.redirect('register');
    }
}));

router.get('/login', (req, res) =>{
	res.render('user/login');
})

router.post('/login',  passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
	console.log("success");
	console.log(req.body);
    req.flash('success', 'welcome back!');
    delete req.session.returnTo;
    res.redirect('/invoice');
})

var fullHash;
var nameofuser;
var phone1

router.post('/sendOTP', catchAsync(async(req, res,next) => {
	var user 
	
	 query = {username:req.body.username}
	  await User.find(query,function(err, result){
		if(err){
			user = err;
			console.log(err)
			
		}
		else{
			user = result[0];
			console.log(user.username);
		}})
		phone1 = '+91'+user.phone;
	
	console.log(phone1)
	
	const otp = Math.floor(100000 + Math.random() * 900000);
	const ttl = 2 * 60 * 1000;
	const expires = Date.now() + ttl;
	const data = `${phone1}.${otp}.${expires}`;
	const hash = crypto.createHmac('sha256', sms_key).update(data).digest('hex');
	fullHash = `${hash}.${expires}`;

	client.messages
		.create({
			from: +13238949329,
			to: phone1,
			body: `Your One Time Login Password For CFM is ${otp}`,
			
		})
		.then((messages) => console.log(messages))
		.catch((err) => console.error(err));

	// res.status(200).send({ phone, hash: fullHash, otp });  // this bypass otp via api only for development instead hitting twilio api all the time
	res.status(200).redirect('/enterOTP')         // Use this way in Production
}));

router.get('/enterOTP', (req, res)=>{
	res.render('user/otp',{phone1})
})

router.post('/verifyOTP', (req,res)=>{


	const phone = phone1;
	const otp = req.body.otp;
	console.log(phone+", " + otp);
	let [ hashValue, expires ] = fullHash.split('.');

	let now = Date.now();
	if (now > parseInt(expires)) {
		return res.status(504).send({ msg: 'Timeout. Please try again' });
	}
	let data = `${phone}.${otp}.${expires}`;
	let newCalculatedHash = crypto.createHmac('sha256', sms_key).update(data).digest('hex');


	if(newCalculatedHash == hashValue){
		console.log('user confirmed');
		const accessToken = jwt.sign({ data: phone }, JWT_AUTH_TOKEN, { expiresIn: '300s' });
		const refreshToken = jwt.sign({ data: phone }, JWT_REFRESH_TOKEN, { expiresIn: '1y' });
		refreshTokens.push(refreshToken);
		res
			.status(202)
			.cookie('refreshToken', refreshToken, {
				expires: new Date(new Date().getTime() + 31557600000),
				sameSite: 'strict',
				httpOnly: true
			})
			.cookie('accessToken', accessToken, {
				expires: new Date(new Date().getTime() + 300000),
				sameSite: 'strict',
				httpOnly: true
			})
			.cookie('authSession', true, { expires: new Date(new Date().getTime() + 30 * 1000), sameSite: 'strict' })
			.cookie('refreshTokenID', true, {
				expires: new Date(new Date().getTime() + 31557600000),
				sameSite: 'strict'
			})
			.redirect('/userprofile');

	}
	else{
		console.log("Not authenticated")
		return res.status(400).send({verification: false, msg:`user is not confirmed`})

	}

	console.log(req.cookies);

})

router.get('/userprofile', async(req, res)=>{
	var user;
	query = {username:"Saiteja"}
	  await User.find(query,function(err, result){
		if(err){
			user = err;
			console.log(err)
			
		}
		else{
			user = result[0];
			console.log(user.username);
			return res.render('user/user', {user});
		}
		res.redirect('/login')
	})
	

	
	
})





router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', "Goodbye!");
    res.redirect('/');
})


async function authenticateUser(req, res, next) {
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

module.exports = router,authenticateUser