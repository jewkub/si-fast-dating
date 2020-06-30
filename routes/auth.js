const express = require('express');
const router = express.Router();
const User = require('../models/user.js');

const session = require('cookie-session');
const flash = require('connect-flash');

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

router.use(session({
  name: 'session',
  secret: process.env.SESSION_SECRET,
  cookie: {
    expires: new Date(2147483647000) // Tue, 19 Jan 2038 03:14:07 GMT
  },
  /* saveUninitialized: false,
  resave: true */
}));

router.use(flash());

// Passport init
router.use(passport.initialize());
router.use(passport.session());

passport.use(new GoogleStrategy({
	clientID: process.env.GOOGLE_CLIENT_ID,
	clientSecret: process.env.GOOGLE_CLIENT_SECRET,
	callbackURL: "https://si-fast-dating.el.r.appspot.com/auth/google/callback"
}, function(accessToken, refreshToken, profile, cb) {
	// In this example, the user's Facebook profile is supplied as the user
	// record.  In a production-quality application, the Facebook profile should
	// be associated with a user record in the application's database, which
	// allows for account linking and authentication with other identity
	// providers.
	
	// console.log('profile = ');
	// console.log(profile);
	return cb(null, profile);
}));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

// Endpoint to login
router.get('/login',
  passport.authenticate('google', {
		scope: ['profile', 'email'],
    successRedirect: '/',
    failureRedirect: '/error',
    successFlash: false /* 'Login success' */,
    failureFlash: true
  })
);

router.get('/auth/google/callback',
	passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  }
);

// Endpoint to get current user
router.get('/user', function(req, res){
	// console.log(req.user);
  res.json(req.user || {id: null});
});

// Endpoint to logout
router.get('/logout', function(req, res){
  req.logout();
  req.flash('success', 'Logout success');
  res.redirect('/');
  // console.log(req.user);
});

module.exports = router;