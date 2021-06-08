const express = require('express');
const router = express.Router({mergeParams: true});
const User = require('../modules/user');
const catchAsync = require('../utils/catchAsyn');
const passport = require('passport');

router.get('/register', (req, res) =>{
    res.render('user/register');
})

router.post('/register', catchAsync(async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/invoice');
        })
    } catch (e) {
        req.flash('Error', e.message);
        res.redirect('register');
    }
}));

router.get('/login', (req, res) =>{
    res.render('user/login');
})

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'welcome back!');
    const redirectUrl = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
})

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', "Goodbye!");
    res.redirect('/');
})

module.exports = router